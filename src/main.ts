import { API, createCollectIterator, VK } from 'vk-io';
import { WallWallComment } from 'vk-io/lib/api/schemas/objects';

// Импортируем файл с переменными окружения
import 'dotenv/config';
import {
  WallGetCommentsResponse,
  WallGetResponse,
} from 'vk-io/lib/api/schemas/responses';

// Токен пользователя
const TOKEN = process.env.VK_TOKEN_USER as string;
// Группа где будем удалять комментарии
const VK_ID_GROUP = Number(process.env.VK_GROUP_ID_DELETE_COMMENTS);
// Чьи комментарии будем удалять
const VK_ID_MY = Number(process.env.VK_USER_ID);
const vk = new VK({ token: TOKEN });

const api = new API({
  token: TOKEN,
});

const getPosts = async (): Promise<WallGetResponse['items']> => {
  const iterator = createCollectIterator<WallGetResponse>({
    api,

    method: 'wall.get',
    params: {
      owner_id: VK_ID_GROUP,
    },

    // Максимальный count в методе
    countPerRequest: 100,

    // Устанавливайте опцию для методов которые не позволяет получить больше N данных, например `users.search`
    // maxCount: 1000,

    // Количество попыток вызвать снова при ошибке
    // retryLimit: 3,

    // Количество паралельных вызовов если поддерживается execute
    // parallelRequests: 25
  });

  const response: WallGetResponse['items'] = [];
  for await (const chunk of iterator) {
    // @ts-ignore
    response.push(...chunk.items);
  }

  const date = {
    from: new Date(2023, 0, 1).getTime() / 1000,
    to: new Date(2023, 11, 31).getTime() / 1000,
  };
  return response.filter(
    (post) => post.date && post.date > date.from && post.date < date.to,
  );
};

const getCommentsPost = async (
  postId: number,
): Promise<WallGetCommentsResponse['items']> => {
  const iterator = createCollectIterator<WallGetCommentsResponse>({
    api,

    method: 'wall.getComments',
    params: {
      post_id: postId,
      owner_id: VK_ID_GROUP,
    },

    // Максимальный count в методе
    countPerRequest: 100,

    // Устанавливайте опцию для методов которые не позволяет получить больше N данных, например `users.search`
    // maxCount: 1000,

    // Количество попыток вызвать снова при ошибке
    // retryLimit: 3,

    // Количество паралельных вызовов если поддерживается execute
    // parallelRequests: 25
  });

  const response: WallGetCommentsResponse['items'] = [];
  for await (const chunk of iterator) {
    response.push(...chunk.items);
  }

  return response;
};

const checkMyCommentPost = async (comments: WallWallComment[]) => {
  const myComments = comments.filter(({ from_id }) => from_id == VK_ID_MY);
  // Перебираем комментарии
  for (const comment of myComments) {
    // Проверяем, принадлежит ли комментарий текущему пользователю
    if (comment.id) {
      // Удаляем комментарий
      await deleteComment(comment.id);
    }
  }
};

const deleteComment = async (commentId: number) => {
  try {
    // Удаляем комментарий
    const deleteCom = await vk.api.wall.deleteComment({
      owner_id: VK_ID_GROUP,
      comment_id: commentId,
    });

    // Выводим сообщение об успешном удалении
    if (deleteCom === 1) console.log(`Комментарий ${commentId} удален`);
  } catch (error) {
    // Выводим сообщение об ошибке
    // @ts-ignore
    console.error(
      `Ошибка удаления комментария id${commentId}. Message: ${error}`,
    );
  }
};

const start = async () => {
  console.log('start');

  // Получаем список постов группы
  const posts = await getPosts();

  // Перебираем посты
  for (const post of posts) {
    // Получаем список комментариев к посту
    if (!post.id) {
      continue;
    }

    const comments = await getCommentsPost(post.id);

    // Проверяем комментарии
    await checkMyCommentPost(comments);
  }

  console.log('finish');
};
start();
