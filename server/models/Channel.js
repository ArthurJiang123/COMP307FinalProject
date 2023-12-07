//const pool = require('../config/db.mjs');
/*
In our project, we assume there is only a default channel(i.e. general) for each board.
Those database-level channel functions work with the discussionController.js
 */

import pool from '../config/db.js';

export async function getchannelIDbyBoard(boardID){
    const channelResult = await pool.query(
      "SELECT channel_id FROM channels WHERE board_id = $1",
      [boardID]
    );

    const channelIDs = channelResult.rows.map(row => row.channel_id);

    return channelIDs;
    
  }

export async function createChannel(boardID, channelName) {
    const result = await pool.query(
        "INSERT INTO channels (channel_name, board_id) VALUES ($1, $2) RETURNING *",
        [channelName, boardID]
    );

    return result.rows[0];

};


// add a member to the channel
export async function addChannelMember(channelID, userID, isOwner = false){
    await pool.query(
        "INSERT INTO channel_members (channel_id, user_id, is_owner) VALUES ($1, $2, $3)",
        [channelID, userID, isOwner]
    );
};

// find the default channels
export async function findDefaultChannel(boardID){
    const result = await pool.query(
        "SELECT * FROM channels WHERE board_id = $1 AND channel_name = 'general' ",
        [boardID]
    );
    return result.rows[0];
};

// remove a member from all channels of a board
export async function removeAllChannelsMember(boardID, userID){
    // first, select all channels that the user has
    // secondly, narrow-down the range of channels to those that the user joins in a particular board
    // then, remove those channels from the database.
    await pool.query(
        "DELETE FROM channel_members WHERE user_id = $1 AND channel_id IN (SELECT channel_id FROM channels WHERE board_id = $2)",
        [userID, boardID]
    );
}

export async function removeAllChannelsBoard(boardID){
    
    await pool.query(
        "DELETE FROM channel_members WHERE channel_id IN (SELECT channel_id FROM channels WHERE board_id = $1)",
        [boardID]
    );
    await pool.query(
        "DELETE FROM channels WHERE board_id = $1",
        [boardID]
    );
}