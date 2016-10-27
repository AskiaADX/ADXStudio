/**
 * Modal Dialog Plugin
 */
(function (askia) {
    if (!askia || !askia.modalDialog) {
        throw new Error("ModalDialog.js is not loaded, please load it first");
    }

    var modalDialog     = askia.modalDialog,
        autoIncrement   = 0;

    modalDialog.addPlugin('preferences', {
        /**
         * Create form
         * @param  modalDialog
         */
        createButtons : function (modalDialog) {
            autoIncrement++;
            modalDialog.elements.preferences = {};
            var root = modalDialog.elements.bodyContainer,
                el   = modalDialog.elements.preferences,
                options = modalDialog.options || {},
                preferences = options.preferences || {},
                author = (preferences.author) || {};
            
            // Add extra class on the dialog box
            modalDialog.elements.dialog.classList.add('preferences');

            // Title
            el.title = document.createElement('p');
            el.title.className = 'askia-modal-preferences-title';
            el.title.innerHTML = 'Preferences';

            root.appendChild(el.title);

            // User Name
            el.wrapper = document.createElement('div');
            el.wrapper.className = 'askia-modal-preferences-wrapper';
            
            root.appendChild(el.wrapper);
            
            // User Name
            el.userName = document.createElement('div');
            el.userName.className = 'askia-modal-preferences-container';

            el.userNameLabel = document.createElement('label');
            el.userNameLabel.setAttribute('for', 'modal_preferences_user_name_' + autoIncrement);
            el.userNameLabel.innerHTML = 'Author name:';
            el.userName.appendChild(el.userNameLabel);

            el.userNameInput = document.createElement('input');
            el.userNameInput.setAttribute('type', 'text');
            el.userNameInput.setAttribute('id', 'modal_preferences_user_name_' + autoIncrement);
            el.userNameInput.value = author.name || "";
            el.userName.appendChild(el.userNameInput);
            // Register for the auto focus
            modalDialog.elements.autoFocusOn = el.userNameInput;

            el.wrapper.appendChild(el.userName);

            // User Email
            el.userEmail = document.createElement('div');
            el.userEmail.className = 'askia-modal-preferences-container';

            el.userEmailLabel = document.createElement('label');
            el.userEmailLabel.setAttribute('for', 'modal_preferences_user_email_' + autoIncrement);
            el.userEmailLabel.innerHTML = 'Email:';
            el.userEmail.appendChild(el.userEmailLabel);

            el.userEmailInput = document.createElement('input');
            el.userEmailInput.setAttribute('id', 'modal_preferences_user_email_' + autoIncrement);
            el.userEmailInput.setAttribute('type', 'email');
            el.userEmailInput.value = author.email || "";
            el.userEmail.appendChild(el.userEmailInput);

            el.wrapper.appendChild(el.userEmail);

            // Company
            el.company = document.createElement('div');
            el.company.className = 'askia-modal-preferences-container';

            el.companyLabel = document.createElement('label');
            el.companyLabel.setAttribute('for', 'modal_preferences_company_' + autoIncrement);
            el.companyLabel.innerHTML = 'Company:';
            el.company.appendChild(el.companyLabel);

            el.companyInput = document.createElement('input');
            el.companyInput.setAttribute('id', 'modal_preferences_company_' + autoIncrement);
            el.companyInput.setAttribute('type', 'text');
            el.companyInput.value = author.company || "";
            el.company.appendChild(el.companyInput);

            el.wrapper.appendChild(el.company);

            // Website
            el.website = document.createElement('div');
            el.website.className = 'askia-modal-preferences-container';

            el.websiteLabel = document.createElement('label');
            el.websiteLabel.setAttribute('for', 'modal_preferences_website_' + autoIncrement);
            el.websiteLabel.innerHTML = 'Website:';
            el.website.appendChild(el.websiteLabel);

            el.websiteInput = document.createElement('input');
            el.websiteInput.setAttribute('id', 'modal_preferences_website_' + autoIncrement);
            el.websiteInput.setAttribute('type', 'url');
            el.websiteInput.value = author.website || "";
            el.website.appendChild(el.websiteInput);

            el.wrapper.appendChild(el.website);

            // Theme
            el.theme = document.createElement('div');
            el.theme.className = 'askia-modal-preferences-container';

            el.themeLabel = document.createElement('label');
            el.themeLabel.setAttribute('for', 'modal_preferences_theme_' + autoIncrement);
            el.themeLabel.innerHTML = 'Theme: ';
            el.theme.appendChild(el.themeLabel);

            el.themeSelect = document.createElement('select');
            el.themeSelect.setAttribute('id', 'modal_preferences_theme_' + autoIncrement);
            el.theme.appendChild(el.themeSelect);
                        
            var option
            for (var i = 0, l = options.themes.length; i < l; i++) {
                var theme = options.themes[i];
                option = document.createElement('option');
                option.value = theme;
                option.textContent = theme;
                if (preferences.theme === theme) {
                    option.setAttribute('selected', 'selected');
                }
                el.themeSelect.appendChild(option)
            }
            
            el.wrapper.appendChild(el.theme);
            
            // editorFontSize size
            el.editorFontSize = document.createElement('div');
            el.editorFontSize.className = 'askia-modal-preferences-container';

            el.editorFontSizeLabel = document.createElement('label');
            el.editorFontSizeLabel.setAttribute('for', 'modal_preferences_editorFontSize_' + autoIncrement);
            el.editorFontSizeLabel.innerHTML = 'Font-size: ';
            el.editorFontSize.appendChild(el.editorFontSizeLabel);

            el.editorFontSizeSelect = document.createElement('select');
            el.editorFontSizeSelect.setAttribute('id', 'modal_preferences_editorFontSize_' + autoIncrement);
            el.editorFontSize.appendChild(el.editorFontSizeSelect);
                        
            options.policies = ["12","14","16","18","20"];
            for (var i = 0, l = options.policies.length; i < l; i++) {
                var editorFontSize = options.policies[i];
                option = document.createElement('option');
                option.value = editorFontSize;
                option.textContent = editorFontSize;
                if (preferences.editorFontSize === editorFontSize) {
                    option.setAttribute('selected', 'selected');
                }
                el.editorFontSizeSelect.appendChild(option)
            }
            
            el.wrapper.appendChild(el.editorFontSize);
            
            
            // Open the latest project by default
            el.reopenLastProject = document.createElement('div');
            el.reopenLastProject.className = 'askia-modal-preferences-checkbox-container';

            el.reopenLastProjectInput = document.createElement('input');
            el.reopenLastProjectInput.setAttribute('id', 'modal_preferences_reopenLastProject_' + autoIncrement);
            el.reopenLastProjectInput.setAttribute('type', 'checkbox');
            if (preferences.openLastProjectByDefault) {
                el.reopenLastProjectInput.setAttribute('checked', 'checked');
            }
            el.reopenLastProject.appendChild(el.reopenLastProjectInput);

            el.reopenLastProjectLabel = document.createElement('label');
            el.reopenLastProjectLabel.setAttribute('for', 'modal_preferences_reopenLastProject_' + autoIncrement);
            el.reopenLastProjectLabel.innerHTML = "Reopen last project on startup";
            el.reopenLastProject.appendChild(el.reopenLastProjectLabel);

            el.wrapper.appendChild(el.reopenLastProject);

            // Use double click to open a file in the explorer
            el.DblClick = document.createElement('div');
            el.DblClick.className = 'askia-modal-preferences-checkbox-container';

            el.DblClickInput = document.createElement('input');
            el.DblClickInput.setAttribute('id', 'modal_preferences_DblClick_' + autoIncrement);
            el.DblClickInput.setAttribute('type', 'checkbox');
            if (preferences.useDblClickByDefault) {
                el.DblClickInput.setAttribute('checked', 'checked');
            }
            el.DblClick.appendChild(el.DblClickInput);

            el.DblClickLabel = document.createElement('label');
            el.DblClickLabel.setAttribute('for', 'modal_preferences_DblClick_' + autoIncrement);
            el.DblClickLabel.innerHTML = "Use double click to open file from the explorer";
            el.DblClick.appendChild(el.DblClickLabel);

            el.wrapper.appendChild(el.DblClick);
            
            // Use zendesk publisher
            el.useZendesk = document.createElement('div');
            el.useZendesk.className = 'askia-modal-preferences-checkbox-container';

            el.useZendeskInput = document.createElement('input');
            el.useZendeskInput.setAttribute('id', 'modal_preferences_useZendesk_' + autoIncrement);
            el.useZendeskInput.setAttribute('type', 'checkbox');
            if (preferences.useZendesk) {
                el.useZendeskInput.setAttribute('checked', 'checked');
            }
            el.useZendesk.appendChild(el.useZendeskInput);

            el.useZendeskLabel = document.createElement('label');
            el.useZendeskLabel.setAttribute('for', 'modal_preferences_useZendesk_' + autoIncrement);
            el.useZendeskLabel.innerHTML = "Use Zendesk publisher";
            el.useZendesk.appendChild(el.useZendeskLabel);
            
            el.wrapper.appendChild(el.useZendesk);
            
            // Username
            el.loginZendesk = document.createElement('div');
            el.loginZendesk.className = 'askia-modal-preferences-container';

            el.loginZendeskLabel = document.createElement('label');
            el.loginZendeskLabel.setAttribute('for', 'modal_preferences_loginZendesk_' + autoIncrement);
            el.loginZendeskLabel.innerHTML = 'Zendesk login:';
            el.loginZendesk.appendChild(el.loginZendeskLabel);

            el.loginZendeskInput = document.createElement('input');
            el.loginZendeskInput.setAttribute('id', 'modal_preferences_loginZendesk_' + autoIncrement);
            el.loginZendeskInput.setAttribute('type', 'text');
            el.loginZendeskInput.value = preferences.loginZendesk || "";
            el.loginZendesk.appendChild(el.loginZendeskInput);
            if (!el.useZendeskInput.checked) {
                el.loginZendeskInput.setAttribute('disabled', 'disabled');
                el.loginZendeskInput.value = "";
            }

            el.wrapper.appendChild(el.loginZendesk);
            
            // Password
            el.password = document.createElement('div');
            el.password.className = 'askia-modal-preferences-container';

            el.passwordLabel = document.createElement('label');
            el.passwordLabel.setAttribute('for', 'modal_preferences_password_' + autoIncrement);
            el.passwordLabel.innerHTML = 'Password:';
            el.password.appendChild(el.passwordLabel);

            el.passwordInput = document.createElement('input');
            el.passwordInput.setAttribute('id', 'modal_preferences_password_' + autoIncrement);
            el.passwordInput.setAttribute('type', 'text');
            el.passwordInput.value = preferences.password || "";
            el.password.appendChild(el.passwordInput);
            if (!el.useZendeskInput.checked) {
                el.passwordInput.setAttribute('disabled', 'disabled');
                el.passwordInput.value = "";
            }

            el.wrapper.appendChild(el.password);
            
            // Url of zendesk
            el.uri = document.createElement('div');
            el.uri.className = 'askia-modal-preferences-container';

            el.uriLabel = document.createElement('label');
            el.uriLabel.setAttribute('for', 'modal_preferences_uri_' + autoIncrement);
            el.uriLabel.innerHTML = 'Url Zendesk:';
            el.uri.appendChild(el.uriLabel);

            el.uriInput = document.createElement('input');
            el.uriInput.setAttribute('id', 'modal_preferences_uri_' + autoIncrement);
            el.uriInput.setAttribute('type', 'text');
            el.uriInput.value = preferences.uri || "";
            el.uri.appendChild(el.uriInput);
            if (!el.useZendeskInput.checked) {
                el.uriInput.setAttribute('disabled', 'disabled');
                el.uriInput.value = "";
            }

            el.wrapper.appendChild(el.uri);
            
            // DemoUrl
            el.uriDemo = document.createElement('div');
            el.uriDemo.className = 'askia-modal-preferences-container';

            el.uriDemoLabel = document.createElement('label');
            el.uriDemoLabel.setAttribute('for', 'modal_preferences_uriDemo_' + autoIncrement);
            el.uriDemoLabel.innerHTML = 'Url demo:';
            el.uriDemo.appendChild(el.uriDemoLabel);

            el.uriDemoInput = document.createElement('input');
            el.uriDemoInput.setAttribute('id', 'modal_preferences_uriDemo_' + autoIncrement);
            el.uriDemoInput.setAttribute('type', 'text');
            el.uriDemoInput.value = preferences.uriDemo || "";
            el.uriDemo.appendChild(el.uriDemoInput);
            if (!el.useZendeskInput.checked) {
                el.uriDemoInput.setAttribute('disabled', 'disabled');
                el.uriDemoInput.value = "";
            }

            el.wrapper.appendChild(el.uriDemo);
            
            // Section title
            el.sectionTitle = document.createElement('div');
            el.sectionTitle.className = 'askia-modal-preferences-container';

            el.sectionTitleLabel = document.createElement('label');
            el.sectionTitleLabel.setAttribute('for', 'modal_preferences_sectionTitle_' + autoIncrement);
            el.sectionTitleLabel.innerHTML = 'Section title:';
            el.sectionTitle.appendChild(el.sectionTitleLabel);

            el.sectionTitleInput = document.createElement('input');
            el.sectionTitleInput.setAttribute('id', 'modal_preferences_sectionTitle_' + autoIncrement);
            el.sectionTitleInput.setAttribute('type', 'text');
            el.sectionTitleInput.value = preferences.sectionTitle || "";
            el.sectionTitle.appendChild(el.sectionTitleInput);
            if (!el.useZendeskInput.checked) {
                el.sectionTitleInput.setAttribute('disabled', 'disabled');
                el.sectionTitleInput.value = "";
            }

            el.wrapper.appendChild(el.sectionTitle);
            
            // Disable Comment
            el.commentDisable = document.createElement('div');
            el.commentDisable.className = 'askia-modal-preferences-checkbox-container';

            el.commentDisableInput = document.createElement('input');
            el.commentDisableInput.setAttribute('id', 'modal_preferences_commentDisable_' + autoIncrement);
            el.commentDisableInput.setAttribute('type', 'checkbox');
            if (preferences.commentDisable) {
                el.commentDisableInput.setAttribute('checked', 'checked');
            }
            el.commentDisable.appendChild(el.commentDisableInput);

            el.commentDisableLabel = document.createElement('label');
            el.commentDisableLabel.setAttribute('for', 'modal_preferences_commentDisable_' + autoIncrement);
            el.commentDisableLabel.innerHTML = "Disable Comment";
            el.commentDisable.appendChild(el.commentDisableLabel);
            if (!el.useZendeskInput.checked) {
                el.commentDisableInput.setAttribute('disabled', 'disabled');
                el.commentDisableInput.checked = false;
            }

            el.wrapper.appendChild(el.commentDisable);
            
            // Promoted
            el.promoted = document.createElement('div');
            el.promoted.className = 'askia-modal-preferences-checkbox-container';

            el.promotedInput = document.createElement('input');
            el.promotedInput.setAttribute('id', 'modal_preferences_promoted_' + autoIncrement);
            el.promotedInput.setAttribute('type', 'checkbox');
            if (preferences.promoted) {
                el.promotedInput.setAttribute('checked', 'checked');
            }
            el.promoted.appendChild(el.promotedInput);

            el.promotedLabel = document.createElement('label');
            el.promotedLabel.setAttribute('for', 'modal_preferences_promoted_' + autoIncrement);
            el.promotedLabel.innerHTML = "Promoted";
            el.promoted.appendChild(el.promotedLabel);
            if (!el.useZendeskInput.checked) {
                el.promotedInput.setAttribute('disabled', 'disabled');
                el.promotedInput.checked = false;
            }

            el.wrapper.appendChild(el.promoted);

            // OK / Cancel button
            
            el.useZendesk.addEventListener ("change", function (event){               
                if (!el.useZendeskInput.checked) {
                    el.loginZendeskInput.setAttribute('disabled', 'disabled');
                    el.passwordInput.setAttribute('disabled', 'disabled');
                    el.uriInput.setAttribute('disabled', 'disabled');
                    el.uriDemoInput.setAttribute('disabled', 'disabled');
                    el.promotedInput.setAttribute('disabled', 'disabled');
                    el.commentDisableInput.setAttribute('disabled', 'disabled');
                    el.sectionTitleInput.setAttribute('disabled', 'disabled');
                } else {
                    el.loginZendeskInput.disabled = false;
                    el.passwordInput.disabled = false;
                    el.uriInput.disabled = false;
                    el.uriDemoInput.disabled = false;
                    el.promotedInput.disabled = false;
                    el.commentDisableInput.disabled = false;
                    el.sectionTitleInput.disabled = false;
                }
            });

            modalDialog.addOkButton();
            modalDialog.addCancelButton();
        },

        /**
         * Validate the form
         * @param modalDialog
         * @param retVal
         */
        validate : function validate(modalDialog, retVal) {
            var el   = modalDialog.elements.preferences;
            retVal.value = {
                preferences : {
                    author: {
                        name: el.userNameInput.value,
                        email: el.userEmailInput.value,
                        company: el.companyInput.value,
                        website: el.websiteInput.value
                    },
                    theme: el.themeSelect.value,
                    openLastProjectByDefault : el.reopenLastProjectInput.checked,
                    useDblClickByDefault : el.DblClickInput.checked,
                    useZendesk : el.useZendeskInput.checked,
                    loginZendesk : el.loginZendeskInput.value,
                    password : el.passwordInput.value,
                    uri : el.uriInput.value,
                    uriDemo : el.uriDemoInput.value,
                    promoted : el.promotedInput.checked,
                    commentDisable : el.commentDisableInput.checked,
                    sectionTitle : el.sectionTitleInput.value,
                    editorFontSize : el.editorFontSizeSelect.value
                }
            };
        }
    });

}(window.askia));
