import { getMessages, sendMessage } from './api';

const main = async () => {
  await sendMessage({
    contactId: 'my-contact',
    message: 'Hello!',
  });

  const messagesResponse = await getMessages({
    contactId: 'my-contact',
  });

  if (messagesResponse.ok) {
    console.log('messages', messagesResponse.response.messages);
  }
};

main();
