"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const vk_io_1 = require("vk-io");
// токен пользователя
const TOKEN = 'token';
// группа где будем удалять комментарии
const VK_ID_GROUP = 0;
// чьи комментарии будем удалять
const VK_ID_MY = 0;
const vk = new vk_io_1.VK({ token: TOKEN });
const getPosts = (offset = 0) => __awaiter(void 0, void 0, void 0, function* () {
    const getPostsGroup = yield vk.api.wall.get({
        owner_id: VK_ID_GROUP,
        offset
    });
    return getPostsGroup.items;
});
const getCommentsPost = (postId, offset = 0) => __awaiter(void 0, void 0, void 0, function* () {
    const getComments = yield vk.api.wall.getComments({
        post_id: postId,
        owner_id: VK_ID_GROUP,
        count: 100,
        offset
    });
    if (offset === 0 && getComments.count > 100) {
        console.log(`Комментариев к записи больше 100, получаю еще.`);
        for (let i = offset; i < getComments.count; i += 100) {
            const getComAdd = getCommentsPost(postId, i);
            getComments.items.push(getComAdd);
        }
    }
    return getComments;
});
const checkMyCommentPost = (comments) => { var comments_1, comments_1_1; return __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    console.log('Проверка комментариев');
    try {
        for (comments_1 = __asyncValues(comments); comments_1_1 = yield comments_1.next(), !comments_1_1.done;) {
            const comment = comments_1_1.value;
            if (!(comment === null || comment === void 0 ? void 0 : comment.id))
                return;
            console.log(`Запись: id` + (comment === null || comment === void 0 ? void 0 : comment.post_id));
            if (comment.from_id == VK_ID_MY) {
                yield deleteComment(comment.id);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (comments_1_1 && !comments_1_1.done && (_a = comments_1.return)) yield _a.call(comments_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}); };
const deleteComment = (commentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const deleteCom = yield vk.api.wall.deleteComment({
            owner_id: VK_ID_GROUP,
            comment_id: commentId
        });
        if (deleteCom === 1)
            console.log(`Комментарий ${commentId} удален`);
        else
            console.log(`Комментарий ${commentId} вернул другой ответ. ${deleteCom}`);
    }
    catch (error) {
        // @ts-ignore
        if (error && (error === null || error === void 0 ? void 0 : error.message))
            console.error(`Ошибка удаления комментария id${commentId}. Message: ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'текста нет'}`);
    }
});
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    let offset = 100;
    while (offset < 734) {
        const startPost = yield getPosts(offset);
        console.log(`Offset: ${offset}`);
        for (const post of startPost) {
            if (!(post === null || post === void 0 ? void 0 : post.id))
                return;
            yield getCommentsPost(post.id).then((comments) => __awaiter(void 0, void 0, void 0, function* () {
                console.log(`Запускаю проверку по полученным комментариям, количество ${comments.count}`);
                yield checkMyCommentPost(comments.items);
            }));
        }
        offset += 100;
    }
});
start().then(r => console.log('Запускаюсь'));
