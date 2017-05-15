After building a [custom registration page](../build/registration-form.md) and making it [WordPress default](../configuration/redirections.md), ProfilePress provides the following features to enhance the user registration experience.


* Automagic user login after registration
* Send users a welcome message after registration


## Automagic Login

To automatically log in users immediately they successfully registered an account, follow the steps below.

* Click the ProfilePress **Settings** menu.
* Under **Registration Settings**, check the `Enable auto-login` checkbox

![Registration Settings](img/registration-settings.png)


## Welcome Message

Still on the **Registration Settings**, check the `Enable welcome message` check box to activate the welcome message module and configure the welcome message at **Welcome Message Settings**


![Registration Settings](img/wlcm-msg-settings.png)


You can also use the following placeholders in the message.

* **{{username}}** - Username of the registered user.
* **{{password}}** - Password of the registered user.
* **{{site_title}}** - Site title as defined in General Settings
* **{{first_name}}** - First Name entered by user on registration.
* **{{last_name}}** - Last Name entered by user on registration.


**Note:** The purpose of the `content-Type` field is to describe the data contained in the message body (could be HTML or plain text) so that the email client can accurately parse the content.
