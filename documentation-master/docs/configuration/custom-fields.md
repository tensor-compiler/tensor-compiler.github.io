Although we are quite satisfied with the default profile fields in WordPress profile page; a need to add custom fields might arise in order to collect additional information from your website users.


## An Example

WordPress profile do not include a gender field thus, you are oblivious of the number of users that are male and female.


How about the Contact info? By default, only E-mail and website are included in WordPress.


![WordPress profile contact info](img/wp-profile-contact.png)


ProfilePress makes adding fields to **contact info** and creating custom profile fields easy in WordPress.


Before we go over the process of adding custom fields to WordPress, it's worth noting that when ProfilePress is installed and activated, the following are added to the **contact info** section: Facebook, Twitter, LinkedIn and Google+.


![WordPress profile contact info](img/pp-contact-info.png)


And a `Gender` custom field is added beneath the **Other Information section**.


Having said all that, let's see how custom profile fields are created with ProfilePress.


## Custom Fields in Contact Info.

To add more contact field to the `contact info` section of WordPress profile, follow the instructions below.


Click the `Profile Contact Info` menu link.


Click the Add New button.


![Add a new contact info field to WordPress user profile](img/add-new-contact-info.png)


Enter the field's label and key.


![Adding Reddit as contact info to WordPress user profile](img/add-reddit-contact-field.png)


<div class="hljs">
<p>The label is what is shown besides the contact info field while the key is used internally by ProfilePress and WordPress.</p>

<p>Say you want to a field for users to enter their Reddit profile URL, enter <code>Reddit Username</code> as the label, <code>reddit</code> as the key then hit the <strong>Add Contact</strong> button.</p>
</div><br/>


After saving, you should see the Reddit field added to **Contact Info**.


![Adding Reddit as contact info to WordPress user profile](img/reddit-contact-info.png)



## Custom Profile Fields in WordPress Profile


To add a custom profile field that will appear beneath the Other Information section in default WordPress profile, see the instructions below.


Click the `Custom Profile Fields` menu.


Click the `Add New` button.


Fill out the form and click the **Add Field** button.

### Form Fields Description

Below are the form fields and their description.


* **Field Label:** the label or text that will be shown besides the custom field.


* **Field Key:** the key is used internally by ProfilePress in creating and saving values for the custom field. The field key cannot contain any character except for a lower-case alphabet, number and underscore.


* **Field Description:** Description of the field. This is the text that will be shown below the custom field.


* **Type:** The form element to use as the form field.


* **Options:** Only for use when multiple Choices i.e Select Box and Radio Buttons is chosen as the field type.  
Say you want to add a radio button with options "yes" and "no"; choose Radio Buttons in `Type` and add the radio button options to the Options field separated
by a comma ( i.e. yes, no ).  
Same goes for the select and check box.



## Custom Profile Fields in ProfilePress

It is worth noting that [custom contact info.](#custom-fields-in-contact-info) and [custom profile fields](#custom-profile-fields-in-wordpress-profile) are both custom profile fields; at least, that's how [ProfilePress](http://profilepress.net/pricing/) treats them.


With that cleared, let's see how custom fields can be added to login, registration, edit profile forms and front-end user profile pages created with ProfiPress.


### Registration Forms

To add a custom profile field to a [registration form](../build/registration-form.md) created by ProfilePress, the services of `[reg-cpf]` shortcode is employed.


The two important attribute for this shortcode are the field `key` and `type`.


Using the reddit contact info. we created earlier; to add a form field to a ProfilePress registration where users can enter their reddit profile url during registration, the shortcode will pretty much be as follows save for the title, class, id, value and required attributes.

```
[reg-cpf key="reddit" type="text" class="" id="" required]
```


**Note:** the `required` unnamed attribute specifies that the user must fill in a value in the field before submitting the form.


### Edit-profile Forms

To add a custom profile field to an **edit profile form** created by ProfilePress, the services of `[edit-profile-cpf]` shortcode is employed.


Say add form field where users can edit their reddit profile URL is to be added to an [edit profile form](../build/edit-profile.md), the shortcode below is basically wwhat is needed.


```
[edit-profile-cpf key="reddit" type="text"]
```


### Front-end User Profile

To display the value or data of the reddit profile field (saved by users either during registration or editing their profile) in a [front-end user profile](../build/user-profile.md), use the `[profile-cpf]` shortcode like so:


```
[profile-cpf key="reddit"]
```
