const sequelize = require('./init');
const MarkerModel = require('./models/Marker');
const ArticleModel = require('./models/Article');
const UserModel = require('./models/User');
const ConversationModel = require('./models/Conversation');
const CommentModel = require('./models/Comment');
const EventModel = require('./models/Event');
const QuizModel = require('./models/Quiz');
const QuizQuestionModel = require('./models/QuizQuestion');
const QuizAnswerModel = require('./models/QuizAnswer');

const models = {};

[
  MarkerModel,
  ArticleModel,
  UserModel,
  ConversationModel,
  EventModel,
  CommentModel,
  QuizModel,
  QuizQuestionModel,
  QuizAnswerModel
].map(modelItem => {
  models[modelItem.name] = sequelize.define(modelItem.name, {
    ...modelItem.model
  });
});

models.quizAnswers.belongsTo(models.quizQuestions, {
  foreignKey: { allowNull: false },
  as: 'question',
  onDelete: 'cascade',
});

models.quizQuestions.belongsTo(models.quizzes, {
  foreignKey: { allowNull: false },
  as: 'quiz',
  onDelete: 'cascade',
});
models.quizQuestions.hasMany(models.quizAnswers, {
  onDelete: 'cascade',
  as: 'answers',
  foreignKey: 'questionId'
});

models.quizzes.hasMany(models.quizQuestions, {
  onDelete: 'cascade',
  as: 'questions',
  foreignKey: 'quizId'
});


models.events.belongsTo(models.users, {
  foreignKey: { allowNull: false },
  as: 'organizedBy',
  allowNull: false
});


models.comments.belongsTo(models.users, {
  foreignKey: { allowNull: false },
  as: 'user',
  allowNull: false
});
models.comments.belongsTo(models.conversations);

models.users.hasMany(models.comments, {
  foreignKey: 'userId',
  as: 'comments'
});
// models.users.hasMany(models.events, { as });

models.conversations.hasMany(models.comments, { foreignKey: 'conversationId' });
models.conversations.belongsTo(models.articles);

// sequelize.sync({force: true})
sequelize.sync({})
  .then(() => {
    console.log('sync tables successfull');
  });

module.exports = {
  ...models,
  sequelize
};
