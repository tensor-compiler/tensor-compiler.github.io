ProfilePress is bundled with a social login feature whereby users can log in to their existing account or create an account using their social media accounts.  


Currently, only Facebook, Twitter, LinkedIn, Google GitHub and VK.com () are supported. More coming soon.


See the links below to learn how to create applications in the various supported social networks in order to get the required app credentials.

* [Creating Facebook Applications](facebook.md)
* [Creating Twitter Applications](twitter.md)
* [Creating LinkedIn Applications](linkedin.md)
* [Creating Google+ Application](google.md)
* [Creating GitHub Applications](github.md)
* [Creating VK.com Applications](vk.md)


**Note:** The generated application credentials should go into appropriate form fields in `Social Login` settings page and then saved.


![ProfilePress social login settings page](img/social-app-credentials.png)


## Social Login in Registration & Login Forms

ProfilePress ships with social login buttons for Facebook, Twitter, LinkedIn, Google and GitHub.


Below are the shortcodes for the social login buttons where `size` is the font size of the button text.


Note: the `size` attribute is optional with a default value of 13(px).


![ProfilePress social login settings page](img/pp-social-login-buttons.png)


* **Facebook**
```
[social-button type="facebook" size="13"]Sign in with Facebook[/social-button]
```


* **Twitter**
```
[social-button type="twitter" size="13"]Sign in with Twitter[/social-button]
```


* **LinkedIn**
```
[social-button type="linkedin" size="13"]Sign in with LinkedIn[/social-button]
```


* **Google**
```
[social-button type="google" size="13"]Sign in with Google[/social-button]
```


* **GitHub**
```
[social-button type="github" size="13"]Sign in with Github[/social-button]
```


* **VK.com**
```
[social-button type="vk" size="13"]Sign in with VK[/social-button]
```


To add the buttons to a [login](../build/login-form.md) and [registration form](../build/registration-form.md) form created by ProfilePress, copy and pasted any of the button shortcode(s) to a desired location in the form.


ProfilePress also include the following shortcodes that returns the social login URL for the supported social networks incase you want to build your own buttons or customized links.


* **[facebook-login-url]** URL to login with Facebook.
* **[twitter-login-url]**  URL to login with Twitter.
* **[linkedin-login-url]**  URL to login with LinkedIn.
* **[google-login-url]**  URL to login with Google.
* **[github-login-url]**  URL to login with GitHub.
* **[vk-login-url]**  URL to login with VK.com (VKontakte).
