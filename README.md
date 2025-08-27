# Instagram Messaging API via Messenger App 
## Prerequisites

1. **Instagram Professional** account (Business or Creator).
2. **Facebook Page** that will be linked to the Instagram account.
3. **Meta Developer Account** and a **Messenger App** (App type should be *Business*).

### Enable Access to Messages
In the Instagram app settings:
1. Open Messages and Story Replies.
2. Open Message Requests and enable **Allow access to messages**.

## Step‑by‑Step: Meta Dashboard

1. **Create / Open your App**
  1. Go to Meta for Developers https://developers.facebook.com/
  2. Click **Create App**
  3. Enter the app name
  4. Select other and click next
  5. Choose **Business** 

2. **Add Products**
      1. In your app, click **Add products**
      2. Select **Messenger**.
      3. Inside **Messenger**, open **Instagram Settings**.

3. **Add Instagram account to the App**
Make sure your Instagram Professional account is **connected** to your Facebook Page
     1. In Instagram Settings, click **Add or remove Instagram Pages**.
     3. Log in and select your Facebook Page and Instagram account.

4. **Generate Page Access Token**
     1. In Instagram Settings, click **Generate Token** and save the token.
     2. Use this **Page Access Token** for `/messages` send API.


5. **Permissions**
When you add your Instagram page to the app, the following permissions are enabled automatically:
    1. `instagram_manage_messages`
    2. `pages_manage_metadata` 
    3. `instagram_basic`

6. **Webhooks**
    1. In Instagram Settings, scroll down to Webhooks.
    2. Add your Callback URL and Verify Token.
    3. Subscribe to `messages`, `messages_seen` , `messages_reaction`.

7. **App Roles**
    1. In App Roles, add a tester by entering their Facebook ID.
    2. The tester must accept the invite in their App Dashboard https://developers.facebook.com/apps/ .
    3. Once accepted, you can send and receive messages with their Instagram Scoped User ID (IGSID).


## Policies: 24‑Hour Window 
 You can respond with promotional/non‑promotional content **within 24 hours** of the user’s last message.


You can now receive DMs via webhooks and reply through the Graph API.

