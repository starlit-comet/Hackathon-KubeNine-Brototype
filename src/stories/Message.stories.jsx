import React from 'react';
import Message from '../components/Message'; // adjust the import path if needed
import '../components/Message.css';

export default {
  title: 'Components/Message',
  component: Message,
  parameters: {
    layout: 'centered',
  },
};

// 🧠 Helper function to create a timestamp easily
const now = new Date();
const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

// 🎯 Template to render component
const Template = (args) => <Message {...args} />;

// ✅ Own message (sent by current user)
export const OwnMessage = Template.bind({});
OwnMessage.args = {
  isOwn: true,
  message: {
    msg: 'Hey! This is my own message 👋',
    ts: now.toISOString(),
    u: { username: 'johndoe', name: 'John Doe' },
  },
};

// ✅ Other user message
export const OtherMessage = Template.bind({});
OtherMessage.args = {
  isOwn: false,
  message: {
    msg: 'Hey John! Got your message 🙂',
    ts: tenMinutesAgo.toISOString(),
    u: { username: 'alice', name: 'Alice' },
  },
};

// ✅ Message with image attachment
export const WithImageAttachment = Template.bind({});
WithImageAttachment.args = {
  isOwn: false,
  message: {
    msg: 'Check out this screenshot!',
    ts: now.toISOString(),
    u: { username: 'bob', name: 'Bob' },
    attachments: [
      {
        image_url: 'https://placekitten.com/300/200',
        title: 'Cute kitten 🐱',
        description: 'This kitten looks adorable!',
      },
    ],
  },
};

// ✅ Message from yesterday
export const FromYesterday = Template.bind({});
FromYesterday.args = {
  isOwn: true,
  message: {
    msg: 'This was sent yesterday.',
    ts: yesterday.toISOString(),
    u: { username: 'johndoe', name: 'John Doe' },
  },
};
