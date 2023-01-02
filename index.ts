import {VK} from 'vk-io'
import { WallWallComment } from 'vk-io/lib/api/schemas/objects';
// токен пользователя
const TOKEN = 'token';
// группа где будем удалять комментарии
const VK_ID_GROUP = 0;
// чьи комментарии будем удалять
const VK_ID_MY = 0;
const vk = new VK({token: TOKEN})

const getPosts = async ( offset: number = 0) => {
	const getPostsGroup = await vk.api.wall.get({
		owner_id: VK_ID_GROUP,
		offset
	});
	return getPostsGroup.items;
};

const getCommentsPost = async (postId: number, offset = 0) => {
	const getComments = await vk.api.wall.getComments({
		post_id: postId,
		owner_id: VK_ID_GROUP,
		count: 100,
		offset
	});
	if(offset === 0 && getComments.count > 100) {
		console.log(`Комментариев к записи больше 100, получаю еще.`);
		for(let i = offset; i < getComments.count; i+=100) {
			const getComAdd = getCommentsPost(postId, i);
			getComments.items.push(getComAdd)
		}
	}
	return getComments;
};

const checkMyCommentPost = async (comments:  WallWallComment[]) => {
	console.log('Проверка комментариев')
	for await(const comment of comments) {
		if(!comment?.id) return;
		console.log(`Запись: id` + comment?.post_id)
		if(comment.from_id == VK_ID_MY) {
			await deleteComment(comment.id)		}
		
	}
}

const deleteComment = async (commentId: number) => {
	try {
		const deleteCom = await vk.api.wall.deleteComment({
			owner_id: VK_ID_GROUP,
			comment_id: commentId
		})
		if(deleteCom === 1) console.log(`Комментарий ${commentId} удален`)
		else console.log(`Комментарий ${commentId} вернул другой ответ. ${deleteCom}`)
	} catch (error) {
		// @ts-ignore
		if(error && error?.message) console.error(`Ошибка удаления комментария id${commentId}. Message: ${error?.message ?? 'текста нет'}`);
	}
 }
 
 const start = async () => {
	let offset = 100;
	while(offset < 734) {
		const startPost = await getPosts(offset)
		console.log(`Offset: ${offset}`);
		for (const post of startPost) {
			if (!post?.id) return;
			await getCommentsPost(post.id).then(async(comments) => {
				console.log(`Запускаю проверку по полученным комментариям, количество ${comments.count}`);
				await checkMyCommentPost(comments.items)
			})
		}
		offset+= 100;
	}
 }
start().then(() => console.log('Запускаюсь'));

