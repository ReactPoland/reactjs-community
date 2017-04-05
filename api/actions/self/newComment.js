const resp = require('../../utils/serverResp');
const CommentModel = require('../../db').comments;
const ConversationModel = require('../../db').conversations;

const getConversationId = async (articleId) => {
  const currConvers = await ConversationModel.findOne({
    where: { articleId }
  })
    .then(item => item && item.toJSON() || null )
    .catch(err => console.log(err.message) || null );

  if (currConvers) {
    return {
      success: true,
      itemId: currConvers.id
    };
  }

  return await ConversationModel.create({
    articleId
  }).then(item => ({
    success: true,
    itemId: item.toJSON().id
  }));
};

const newCommentRequest = async ({ body, session }) => {
  if (!body) return resp.error('bad request');

  const { body: commentBody, articleId, parentCommentId } = body;

  const parentComment = await CommentModel.findOne({ where: {
    id: parentCommentId
  } })
    .then(item => {
      if (!item) return null;
      return item.toJSON();
    })
    .catch(() => null);

  let depth = 0;
  let pCommentId = null;
  if (parentComment) {
    depth = parentComment.depth + 1;
    pCommentId = parentComment.id;
  }

  const converResp = await getConversationId(articleId)
  .catch(err => err);

  if (!converResp.success) return resp.error(converResp.message);

  const commentEntity = {
    body: commentBody,
    userId: session.user.id,
    conversationId: converResp.itemId,
    depth,
    parentCommentId: pCommentId
  };

  return CommentModel.create(commentEntity)
    .then(respMess => resp.success(respMess))
    .catch(err => resp.error(err.message));
};

const newComment = (req) => {
  return req.permission.shouldAuth().then(() => newCommentRequest(req));
};

export default newComment;