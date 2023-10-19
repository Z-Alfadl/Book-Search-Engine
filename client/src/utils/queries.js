//Provided by AskBCS Learning Assistant Team member Mia
import { gql } from "@apollo/client";

export const GET_ME = gql`
   {
    me {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId
        authors
        description
        title
        image
      }
    }
  }
`;