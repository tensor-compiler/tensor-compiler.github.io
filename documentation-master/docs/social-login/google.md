Log in to [Google Developers Console](https://console.developers.google.com/project) using your Google's account, click on the **Create Project** button and fill the form to create a project.


![New Google Project or Application](img/new-google-project.png)


Click the newly created project to go to its dashboard.


Click the **API** sub-menu beneath **APIs & auth** and the click **Google+ API** link in **Social APIs** section.


![Google's Social APIs](img/google-social-apis.png)


Click the `Enable API` button to activate it.


![Google's Social APIs](img/enable-googleplus-api.png)


To get the `Client ID` and `Client Secret` keys, click the `Credentials` navigation link beneath  **APIs & auth**,


Click the `Create new Client ID` button and a popup page will be displayed.  
On the popup, click the `Configure consent screen`

![Google's Social APIs](img/create-google-project-id.png)


Fill out the consent screen form and save.


![Google's Social APIs](img/consent-screen-form.png)


At the client ID form, enter your website URL in the **Authorized JavaScript origins** field and the code below into the **Authorized redirect URIs**

```
http://yoursite.com/wp-content/plugins/profilepress/social-login/?hauth.done=Google
```


Change `http://yoursite.com` to your website URL.


![Google's Social APIs](img/google-client-id-form.png)



Click the `Create Client ID` submit button. You will see the application credentials displayed as shown in the image below.


![Google's Social APIs](img/google-app-credentials.png)


Copy and paste the `Client ID` and `Client secrete` to the appropriate field in [Social Login](configuration.md) settings page.
