In this tutorial, we'll learn how to build ProfilePress themes for login, registration, password reset, edit profile form and front-end profile which can be installed in the [theme installer](../install-theme.md) plugin page.


When these themes are installed, they are automatically added to their respective catalog.

## Terminology

**Templates:** Themes for login, registration, password reset, edit profile and front-end profile are individually referred to as *templates*.  
E.g.  "login templates" refers to a login form theme.


**Theme Type:** Login, registration, password reset, edit profile and front-end profile are individually referred to as **Theme type**.
E.g. The sentence "The templates of login theme type" means ProfilePress login form themes.



## Template Structure

Below is the structure of ProfilePress theme folder.
For it to be considered a theme, it must be archived in zip format eg `doyin-template.zip`


```
login/
|- assets/             # Images, JavaScript and other component folder
|- name.txt            # Name or title of the login template
|- structure.html      # Form structure / design
|- stylesheet.css      # CSS stylesheet

|- registration/
|- assets/             # Images, JavaScript and other component folder
|- name.txt            # Name or title of the registration template
|- structure.html      # Form structure / design
|- stylesheet.css      # CSS stylesheet
|- success.txt         # Message on successful user registration

|- password-reset/
|- assets/             # Images, JavaScript and other component folder
|- name.txt            # Name or title of the password reset template
|- structure.html      # Form structure / design
|- stylesheet.css      # CSS stylesheet
|- success.txt         # Message displayed on successful password reset

|- edit-user-profile/
|- assets/             # Images, JavaScript and other component folder
|- name.txt            # Name or title of the template
|- structure.html      # Form structure / design
|- stylesheet.css      # CSS stylesheet
|- success.txt         # Message displayed on successful editing a profile

|- front-end-profile/
|- assets/             # Images, JavaScript and other component folder
|- name.txt            # Name or title of the template
|- structure.html      # Profile design
|- stylesheet.css      # CSS stylesheet
```


One or more templates can be packaged together as a theme but only one template per theme type s allowed.


For example, you can decide to package the following as a theme: login and registration templates; login and password reset templates; only a front end profile template or templates for each of the theme type but you can't package a theme that consist of two templates for a login form.


All assets for the templates be it images, css stysheet, javascripts etc should go into the `assets` folder.


## Including Images, External CSS and JavaScript Libraries

To include images and external libraries to a ProfilePress template, place the files inside the `assets` folder and use the template tag `{{theme_assets}}` (a placeholder for the URL to the assets folder) to call or reference the files.


Assuming you are creating a login template that utilizes [Bootstrap](http://getbootstrap.com). To include the bootstrap css file:

Firstly, copy the `bootstrap.min.css` file to the **assets** folder of your theme package.

To reference the CSS in the login form template, include the code below into the `structure.html` file. Mind you, `structure.html` is where the HTML code for the login form is inserted.

```
<link rel="stylesheet" href="{{theme_assets}}/bootstrap.min.css">
```


To reference it in your CSS stylesheet, see the code below.


```
@import url( {{theme_assets}}/bootstrap.min.css );
```


Here is a [sample theme file](../doyin-template.zip). download, explore and install it to learn more.
