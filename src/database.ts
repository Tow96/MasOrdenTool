/** database.ts
 * Copyright (c) 2022, Towechlabs
 * All rights reserved
 *
 * Class that handles db connection
 */
import mongoose from 'mongoose';
import * as Models from './models';

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
});

const idSchema = new mongoose.Schema({
  ids: [String],
});

const userCollection = mongoose.model<Models.BackendUser>('users', userSchema);
const idCollection = mongoose.model<Models.Ids>('fetchedids', idSchema);

// Functions that communicate to the DB
export default class DB {
  /** getUsers
   * Returns a list with all the users
   *
   * @returns {Models.BackendUser[]} The users from the DB
   */
  static getUsers = async (): Promise<Models.BackendUser[]> => {
    const response = await userCollection.find({});

    return response as Models.BackendUser[];
  };

  /** userExists
   * Returns a specific user if existent
   *
   * @returns {Models.BackendUser[]} The users from the DB
   */
  static userExists = async (username: string): Promise<Models.BackendUser> => {
    const response = await userCollection.findOne({ username: username });

    return response as Models.BackendUser;
  };

  /** addUser
   * Adds a user to the DB
   */
  static addUser = async (user: Models.BackendUser): Promise<void> => {
    await new userCollection({
      email: user.email,
      name: user.name,
      password: user.password,
      username: user.username,
    }).save();

    return;
  };

  /** updateUser
   * Edits a user
   *
   */
  static updateUser = async (id: string, contents: Models.BackendUser): Promise<void> => {
    await userCollection.findByIdAndUpdate(id, contents);

    return;
  };

  /** deleteUser
   * Removes a user using the username
   *
   */
  static deleteUser = async (username: string): Promise<void> => {
    await userCollection.findOneAndDelete({ username: username });

    return;
  };

  /** getIds
   * Returns a list with all the ids that have already been fetched
   *
   * @returns {Models.Ids} The users from the DB
   */
  static getIds = async (): Promise<Models.Ids[]> => {
    const response = await idCollection.find({});

    return response as Models.Ids[];
  };

  /** updateIds
   * Adds an id to the list
   */
  static updateIds = async (nuId: string[]): Promise<void> => {
    await idCollection.findOneAndUpdate({}, { $push: { ids: { $each: nuId } } }, { upsert: true });
  };
}
