//import models, authentication and authError
const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    //getSingleUser
    me: async (parent, args, context) => {
      if (context.user) {
      return User.findOne({ _id: context.user._id});
    }
    throw new AuthenticationError('You must be logged in')
  },
  },
  Mutation: {
    //login
    login: async (parent, { email, password }) => {
      //find user with matching email
      const user = await User.findOne({ email });

      //throw error if no matching user found, process otherwise
      if (!user) {
        throw new AuthenticationError(
          "There is something wrong with the email address provided"
        );
      }
      //Assuming a user is found, compare input password with stored password
      const correctPW = await user.isCorrectPassword(password);

      if (!correctPW) {
        throw new AuthenticationError("That password is not correct");
      }

      //if both conditions pass, create a token for the logged in user
      const token = signToken(user);

      return { token, user };
    },
    //createUser
    addUser: async (parent, { username, email, password }) => {
      //creates user in the database
      const user = await User.create({ username, email, password });
      //create a token for that user
      const token = signToken(user);
      //return user data and token
      return { token, user };
    },
    //saveBook
    saveBook: async (parent, { input }, context) => {
      //check if user is logged in by checking if context has a user field
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          //find user by _id
          { _id: context.user._id },
          //add bookData to the savedBooks array of that user
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      }
      //if not logged in, throw error
      throw new AuthenticationError("You must be logged in to save books");
    },
    removeBook: async (parent, { bookData }, context) => {
      //check if user is logged in
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          //find user by _id
          { _id: context.user._id },
          //Pull book from savedBooks array by its id
          { $pull: { savedBooks: { bookId: bookData } } },
          { new: true }
        );
        return updatedUser;
      }
      //throws error if user is not logged in
      throw new AuthenticationError("You must be logged in to delete books");
    },
  },
};

module.exports = resolvers;
