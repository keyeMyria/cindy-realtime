import { call, put, select, takeLatest, takeEvery } from 'redux-saga/effects';
import { gqlQuery } from 'Environment';
import { connectChat, disconnectChat } from './actions';
import {
  CHANGE_CHANNEL,
  TOGGLE_MINICHAT,
  OPEN_MINICHAT,
  CLOSE_MINICHAT,
  MINICHAT_CONNECT,
  INIT_MINICHAT,
  MINICHAT_MORE,
  MINICHAT_ADDED,
  ADD_MINICHAT,
  MORE_MINICHAT,
  minichatQuery,
  minichatMoreQuery,
  minichatUpdateQuery,
} from './constants';
import { selectChatDomain } from './selectors';

const defaultChannel = (path) => {
  const match = path.match('/puzzle/show/([0-9]+)');
  if (match) return `puzzle-${match[1]}`;
  return 'lobby';
};

const getTrueChannel = (channel) => {
  if (channel === null) {
    return defaultChannel(window.location.pathname);
  }
  return channel;
};

function* onChangeLocation(action) {
  const chat = yield select(selectChatDomain);
  const chatOpen = chat.get('open');
  const chatChannel = chat.get('channel');
  const currentChannel = chat.get('currentChannel');
  if (chatChannel === null && chatOpen === true) {
    const nextChannel = defaultChannel(action.payload.pathname);
    if (nextChannel !== currentChannel) {
      yield put(disconnectChat(currentChannel));
      yield put(connectChat(nextChannel));
    }
  }
}

function* handleToggleChat(action) {
  const chat = yield select(selectChatDomain);
  const chatOpen = chat.get('open');
  const chatChannel = chat.get('channel');
  const nextChannel = getTrueChannel(chatChannel);
  if (chatOpen === true && action.open !== true) {
    yield put({ type: CLOSE_MINICHAT });
    yield put(disconnectChat(nextChannel));
  } else if (chatOpen === false && action.open !== false) {
    yield put({ type: OPEN_MINICHAT });
    yield put(connectChat(nextChannel));
  }
}

function* handleChannelChange(action) {
  const chat = yield select(selectChatDomain);
  const currentChannel = chat.get('currentChannel');
  const nextChannel = getTrueChannel(action.channel);
  if (currentChannel !== nextChannel) {
    yield put(disconnectChat(currentChannel));
    yield put(connectChat(nextChannel));
  }
}

function* fetchAllMinichats(action) {
  const data = yield call(
    gqlQuery,
    { text: minichatQuery },
    { channel: action.channel }
  );
  yield put({ type: INIT_MINICHAT, ...data });
}

function* fetchMoreMinichats() {
  const chat = yield select(selectChatDomain);
  const data = yield call(
    gqlQuery,
    { text: minichatMoreQuery },
    { channel: chat.get('currentChannel'), before: chat.get('startCursor') }
  );
  yield put({ type: MORE_MINICHAT, ...data });
}

function* fetchMinichatUpdate(action) {
  const data = yield call(
    gqlQuery,
    { text: minichatUpdateQuery },
    { id: action.data.id }
  );
  yield put({ type: ADD_MINICHAT, data });
}

// Individual exports for testing
export default function* defaultSaga() {
  yield [
    takeLatest('@@router/LOCATION_CHANGE', onChangeLocation),
    takeEvery(TOGGLE_MINICHAT, handleToggleChat),
    takeLatest(CHANGE_CHANNEL, handleChannelChange),
    takeLatest(MINICHAT_CONNECT, fetchAllMinichats),
    takeLatest(MINICHAT_MORE, fetchMoreMinichats),
    takeEvery(MINICHAT_ADDED, fetchMinichatUpdate),
  ];
}