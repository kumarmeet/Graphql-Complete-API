const express = require("express");
const graphqlHttp = require("express-graphql").graphqlHTTP; //this is for middleware
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const Event = require("./models/event");

const app = express();

app.use(express.json());

const events = [];

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
        type Event{
          _id: ID!
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input EventInput{
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        type RootQuery{
          events: [Event!]!
        }

        type RootMutation{
          createEvent(eventInput: EventInput): Event
        }

        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find();
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.description,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
        });

        return event
          .save()
          .then((result) => {
            console.log(result);
            return { ...result._doc };
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
    },
    graphiql: true,
  })
);

mongoose
  .connect("mongodb://127.0.0.1:27017/graphql-events-api")
  .then(() => {
    console.log("Database connected");
    app.listen(3000);
  })
  .catch(() => {
    console.log("Database not connected");
  });
