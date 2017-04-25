import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import _find from 'lodash/find';
import _isEmpty from 'lodash/isEmpty';
// STORE
import { editArticle, removeArticle } from 'redux/modules/articlesModule';
import { submitComment } from 'redux/modules/conversationModule';
// COMPONENTS
import { Conversation } from 'containers';
import { PlainTextEditor, RichTextEditor, CommentEditor } from 'components';
// LAYOUT
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import FlatButton from 'material-ui/FlatButton';
import { ArticleHeader, List, Div } from 'components/styled';

const mappedState = ({ articles, auth }, props) => ({
  article: _find(articles.all, art => props.params.id === `${art.id}`),
  editingArticle: articles.editingArticle,
  articleEdited: articles.articleEdited,
  removingArticle: articles.removingArticle,
  loggedIn: auth.loggedIn
});

const mappedActions = {
  editArticle,
  removeArticle,
  submitComment,
  pushState: push
};

@connect(mappedState, mappedActions)
export default class ArticlePage extends Component {
  static propTypes = {
    article: PropTypes.object,
    params: PropTypes.object.isRequired,
    editingArticle: PropTypes.bool.isRequired,
    articleEdited: PropTypes.bool.isRequired,
    removingArticle: PropTypes.number,
    editArticle: PropTypes.func.isRequired,
    removeArticle: PropTypes.func.isRequired,
    submitComment: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    loggedIn: PropTypes.bool.isRequired
  }

  state = {
    editingMode: false,
    editedContent: '',
    editedTitle: ''
  }

  componentDidMount() {
    const { article = {}, params = {} } = this.props;
    this.checkSlugAndRedirect(article.slug, params.slug, article.id);
  }

  componentWillReceiveProps(nextProps) {
    const { article = {}, params = {} } = nextProps;
    this.checkSlugAndRedirect(article.slug, params.slug, article.id);
    // When article was successfully updated...
    if (nextProps.articleEdited !== this.props.articleEdited) {
      this.setState({
        editingMode: false,
        editedContent: '',
        editedTitle: ''
      });
    }
  }

  checkSlugAndRedirect = (articleSlug, paramsSlug, articleId) => {
    if ((articleSlug && articleId) && articleSlug !== paramsSlug ) {
      this.props.pushState(`/article/${articleId}/${articleSlug}`);
    }
  }

  // EDITING ARTICLE

  editTitle = (editedTitle) => {
    this.setState({ editedTitle });
  }

  editContent = (serializedState) => {
    this.setState({ editedContent: serializedState });
  }

  toggleEditMode = () => {
    this.setState({
      editingMode: !this.state.editingMode,
      editedContent: this.state.editingMode ? '' : '',
      editedTitle: this.state.editingMode ? '' : ''
    });
  }

  cancelEditing = () => {
    this.setState({
      editingMode: false,
      editedContent: '',
      editedTitle: ''
    });
  }

  validateArticle = (articleData) => {
    const { title } = articleData;
    const validationErrors = {};

    if (!title) validationErrors.title = 'Title is required';
    // if (!content || !content.document.nodes.length) validationErrors.content = 'Content is required';

    this.setState({ validationErrors });

    return _isEmpty(validationErrors);
  }

  // API CALLS

  saveEdits = () => {
    const { article } = this.props;

    const editedArticle = {
      id: article.id,
      title: this.state.editedTitle || article.title,
      content: (this.state.editedContent && JSON.stringify(this.state.editedContent)) || article.content
    };

    if (!this.validateArticle(editedArticle)) return;

    this.props.editArticle(editedArticle);
  }

  removeArticle = () => {
    this.props.removeArticle(this.props.article.id);
  }

  // RENDERING

  renderTitle = () => (
    <h1 style={{ margin: 0 }}>
      <PlainTextEditor
        initialState={this.state.editedTitle || this.props.article.title}
        onChange={this.editTitle}
        readOnly={!this.state.editingMode}
      />
    </h1>
  )

  renderEditor = () => (
    <RichTextEditor
      initialState={this.props.article.content}
      style={{ width: '100%' }}
      readOnly={!this.state.editingMode}
      onChange={this.editContent}
    />
  )

  renderEditButton = () => {
    if (!this.props.loggedIn) return null;

    const { editingMode } = this.state;

    return (
      <FlatButton
        label={editingMode ? 'Cancel' : 'Edit'}
        primary={!editingMode}
        secondary={editingMode}
        onTouchTap={editingMode ? this.cancelEditing : this.toggleEditMode}
      />
    );
  }

  renderDeleteButton = () => {
    if (!this.props.loggedIn || this.state.editingMode) return null;

    return (
      <FlatButton
        label={this.props.removingArticle ? 'Deleting...' : 'Delete'}
        secondary
        onTouchTap={this.removeArticle}
        disabled={this.props.removingArticle !== null}
      />
    );
  }

  renderSaveButton = () => {
    if (!this.state.editingMode) return null;

    return (
      <FlatButton
        label={this.props.editingArticle ? 'Saving...' : 'Save'}
        primary
        onTouchTap={this.saveEdits}
      />
    );
  }

  render() {
    const { article } = this.props;

    if (!article) return null;

    return (
      <Grid style={{ height: '100%' }}>
        <Div flex column fullHeight>
          <Div flexNone>
            <ArticleHeader>
              {this.renderTitle()}
              <List right>
                {this.renderSaveButton()}
                {this.renderEditButton()}
              </List>
            </ArticleHeader>
            {this.renderEditor()}
            <List right>
              {this.renderDeleteButton()}
            </List>
            {this.props.loggedIn && <Row>
              <Col sm={12} md={8}>
                <h3>Add a comment:</h3>
                <CommentEditor articleId={article.id} />
              </Col>
            </Row>}
          </Div>
          <Conversation articleId={article.id} />
        </Div>
      </Grid>
    );
  }
}
