// Inside: /server/controllers/discussionController.js
import { findByUserId, findByBoardId, createBoardModel, deleteBoardModel, addMember, removeMember, getBoardMembersModel, isUserAlreadyMember } from "../models/Board.js";
import { createChannel, addChannelMember, findDefaultChannel, removeAllChannelsMember, removeAllChannelsBoard } from "../models/Channel.js";
import { findByEmail } from "../models/User.js"; // Adjusted import for findByEmail

export async function getBoards(req, res) {
  
  try {
    // the authMiddleware will decode the token and assign the decoded to req.user
    // req.user is of the form {userID : ActualID}
    const boards = await findByUserId(req.user.userID);
    
    res.json(boards);
    
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving discussion boards.' });
  }
}

export const getBoardMembers = async (req, res) => {
  
  try {

      const boardID = req.params.boardID;
      const members = await getBoardMembersModel(boardID);
      res.json(members);

  } catch (error) {
      res.status(500).json({message:'Error getting board members on the database.'});
  }
};

// create a board for the user
// Additionally, create a default channel (general) for the board
export async function createBoard(req, res) {
  
  // suppose boardName is stored in the request body
  const{ boardName } = req.body;
  //console.log("Board name to create:", boardName);

  try{
    
    // still, we suppose the req.user is of the form {userID: ActualID}
    const userID = req.user.userID;
    console.log("userID:", userID);
    const newBoard = await createBoardModel(userID, boardName);

    console.log("In discussionController creareBoard, the new board:", newBoard);

    // Create Default Channel
    const defaultChannelName = "general";
    const defaultChannel = await createChannel(newBoard.board_id, defaultChannelName);

    // add owner to default channel
    await addChannelMember(defaultChannel.channel_id, userID, true); // true => is the owner

    res.json(newBoard);

  }catch(error){

    res.status(500).json({message: "Error when creating a new board -- discussionControllers"});
  }

}

export async function deleteBoard(req, res) {

  // assume the deleted board ID is known in the request URL path's parameters
  const {boardID} = req.params;
  // console.log("In discussionController deleteBoard");
  // console.log("board ID to delete:", boardID);
  // console.log("user ID that requests:", req.user.userID);

  try{

    const board = await findByBoardId(boardID);
    // console.log("The board found by the ID:", board);

    // 1. check if board exists
    if(!board){
      return res.status(404).json({message: "Board not found. Check your inputs."});
    }

    // 2. check if board owner is the user who requests for deletion
    // assume req.user is the decoded token, which is of the form {userID: ActualID}
    if(board.user_id !== req.user.userID){
      return res.status(403).json({message:"Not authorized to delete this board."});
    }

    // console.log("Before removing all channels.");

    // 3. if passing the check, first delete all channels of the board
    await removeAllChannelsBoard(boardID);

    // console.log("After removing all channels.");

    // 4. then, delete the board
    await deleteBoardModel(boardID);
    
    res.json({message: "Board deleted successfullly. You can continue now."});
    
    // console.log("Removed the board from the user correctly");
    
  }catch (error){
    res.status(500).json({message: "Error deleting the board."});
  }
}


// add an member to the board ( and to the default channel)
export async function addBoardMember(req, res){

  const {boardID, userEmail} = req.body;

  try{
    const board = await findByBoardId(boardID);
    
    // userToAdd: {id: xx, fullname:xx, username:xx, password: xx, email:xx }
    const userToAdd = await findByEmail(userEmail);

    // 1. check if the board is found in the database
    if(!board){
      return res.status(404).json({message:"Board not found. Tyry again!"});
    }

    // 2. check if the user has the right to delete the board.
    // suppose the middleware function verifyToken assisn req.user the decoded token of the form {userID: actualID}
    if(board.user_id !== req.user.userID){
      return res.status(403).json({message:"Not authorized to add members to this board."});
    }

    // 3. check if we can find the user in our database
    if(!userToAdd){
      return res.status(404).json({message: "User not found. Check your inputs."});
    }

    // 4. check if it's already a member        
    const isMember = await isUserAlreadyMember(boardID, userToAdd.id);
    if (isMember) {
      return res.status(400).json({ message: "User is already a member." });
    }

    // 5. if passing all the checks, we can add the user!
    await addMember(boardID, userToAdd.id);
    
    // 6. add the user to the default channel
    const defaultChannel = await findDefaultChannel(boardID);
    await addChannelMember(defaultChannel.channel_id, userToAdd.id, false); // "false" means isOwner = false


    res.json({message: "Member added to board successfully"});

  }catch(error){

    res.status(500).json({message:"Error adding members to board."});

  }

}

export async function removeBoardMember(req, res) {

  const {boardID, userEmail} = req.body;
  
  try{
    
    const board = await findByBoardId(boardID);
    // userToRemove: {id: xx, fullname:xx, username:xx, password: xx, email:xx }
    const userToRemove = await findByEmail(userEmail);

    // 1. if no board, returns an error msg
    if(!board){
      return res.status(404).json({message: "Board not found. Try again."});
    }

    // 2. if not authorized, returns an error msg
    if(board.user_id !== req.user.userID){
      return res.status(403).json({message: "Not authorized to remove members from this board."});
    }

    // 3. check if the user is not found. If so, returns an error msg.
    if(!userToRemove){
      return res.status(404).json({message: "User not found. Check your inputs."});
    }

    // 4. does not allow anyone to remove the owner
    if(board.user_id === userToRemove.id){
      return res.status(403).json({message:"Cannot remove the owner!"});
    }

    // 5. remove the member
    await removeMember(boardID, userToRemove.id);

    // 6. also remove the member from all the channels of the board
    await removeAllChannelsMember(boardID, userToRemove.id);


    res.json({message:"Member removed from board successfully."});


  }catch(error){

    res.status(500).json({message: "Error happens in controller when removing members from the board."});

  }

}



