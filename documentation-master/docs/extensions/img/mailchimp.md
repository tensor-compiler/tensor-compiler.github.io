The [MailChimp](http://profilepress.net/downloads/mailchimp/) ProfilePress extension integrates your ProfilePress powered [registration page](../build/registration-form.md) with MailChimp by automatically subscribing users to a specific list immediately they complete registering an account.


To get this feature working on your WordPress powered site, ensure you have the [extension](http://profilepress.net/downloads/mailchimp/) installed and activated.


Click the **Extras** ProfilePress menu link.


At the **MailChimp Addon** section, enter your MailChimp account [API key](https://admin.mailchimp.com/account/api/) into the API field and hit the `Save Changes` button for the plugin to fetch your mailing lists.


Select the list you want users to be subscribed to and save the changes.


![Plugin settings page](img/mc-settings-page.png)


To give users the option to decide whether to opt in or not to your list, add the shortcode `[pp-mailchimp]` to your custom [registration form](../build/registration-form.md).


The shortcode displays a checkbox alongside the label **Subscribe to our email list.** The label can be changed by entering your desired text into the `Checkbox Label` text field.


![Plugin settings page](img/mc-demo.png)

**Note:** If the MailChimp checkbox isn't present in the registration form but the feature is still activated, new users will still be added to the list.


## Manual Inclusion
One feature I love (and am pretty sure you will too) about this extension is the fact you can subscribe a list of emails en masse to your list from within the settings page.


Using the user details below as an example:

```
trisha@gmail.com, Trisha, Rice
matthew@outlook.com, Matthew, Stone
geremi@yahoo.com, Geremi, Njitap
```


**Format:** emailAddress, firstName, lastName.
**Note:** only one user data per line.


If the data above is pasted into the **Manual Inclusion** text area and the `Subscribe` button clicked, the selected email list will automatically be updated.


![MailChimp list updated](img/mc-list-update.png)


The process is ajaxified hence no page reload.


## WordPress to MailChimp Sync

When activated, it watches for changes in WordPress user list and automatically synchronizes any detected changes with a selected MailChimp list.


When users are registered they are subscribed to your MailChimp list. When a user is deleted, it will unsubscribe the user. When users update their email address, first name and last name, the changes are sync / updated in your MailChimp list.


To activate the synchronization feature, check Activate Email Sync in the extension settings page.


![Activate WordPress to MailChimp sync](https://profilepress-523b.kxcdn.com/wp-content/uploads/2015/09/wordpress-mailchimp-sync.png)


If you feel there are users that aren’t in your MailChimp list and you will want to add them, clicking the Sync Now button will do the magic.


![Instantly sync WordPress users to MailChimp](https://profilepress-523b.kxcdn.com/wp-content/uploads/2015/09/wordpress-mailchimp-sync-now.png)


<a href="http://profilepress.net/downloads/mailchimp/?ref=mailchimp_doc">
 <div class="buy-now-green">
      <strong>Buy MailChimp Extension</strong>
 </div>
</a>
