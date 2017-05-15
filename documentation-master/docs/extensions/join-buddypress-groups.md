The [Join BuddyPress Groups](http://profilepress.net/downloads/join-buddypress-groups/) extension allows users to select or choose the **BuddyPress groups** they will like to join at the time of [registration](https://profilepress.net/features/wordpress-front-end-registration-form/) in WordPress.

Registering users are able to select the group to join in two forms.

## Select Dropdown
![Select BuddyPress groups to join on registration](https://profilepress.net/wp-content/uploads/edd/2016/04/buddypress-group-select.png)


## Checkboxes</h3>
![Checkbox selection of BuddyPress groups to join on registration](https://profilepress.net/wp-content/uploads/edd/2016/04/buddypress-group-checkbox.png)

## Setup & Implementation

On installation and activation of this [extension](https://profilepress.net/downloads/join-buddypress-groups/), go to **Extras** settings page.

Under **Join BuddyPress Groups** section, enter your purchase license key and check the "Activate" checkbox.

![Extension settings page](img/join-buddypress-group-settings.png)

Having done all this, add the shortcode `[pp-buddypress-groups]` to your [custom registration form](../build/registration-form.md) to output a checkbox list of groups.

To output a select dropdown of groups, add a `type` attribute with a value of `select` like so:

`[pp-buddypress-groups type="select"]`

To output checkboxes of groups, add a `type` attribute with a value of `checkbox` like so:

`[pp-buddypress-groups type="checkbox"]`

**Note:** if no type attribute is specified, it will default to checkbox.


To add a CSS class and ID to the fields, add a `css` and `id` attribute like so:

`[pp-buddypress-groups type="select" class="css-class" id="css-id"]`

`[pp-buddypress-groups type="checkbox" class="css-class" id="css-id"]`

To limit the number of groups users can select to join via select dropdown, add a limit attribute like so:

`[pp-buddypress-groups type="select" limit="3"]`

<div>
<a href="https://profilepress.net/downloads/join-buddypress-groups/?ref=buddypress-group-doc">
 <div class="buy-now-green">
      <strong>Get BuddyPress Groups Extension</strong>
 </div>
</a>
</div>
