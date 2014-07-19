/*  LOOT

    A load order optimisation tool for Oblivion, Skyrim, Fallout 3 and
    Fallout: New Vegas.

    Copyright (C) 2013-2014    WrinklyNinja

    This file is part of LOOT.

    LOOT is free software: you can redistribute
    it and/or modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    LOOT is distributed in the hope that it will
    be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with LOOT.  If not, see
    <http://www.gnu.org/licenses/>.
*/
'use strict';
var loot = {};
var marked;
function isStorageSupported() {
    try {
        return ('localStorage' in window && window['localStorage'] !== null && window['localStorage'] !== undefined);
    } catch (e) {
        return false;
    }
}
function saveCheckboxState(evt) {
    if (evt.currentTarget.checked) {
        try {
            localStorage.setItem(evt.currentTarget.id, true);
        } catch (e) {
            if (e == QUOTA_EXCEEDED_ERR) {
                alert('Web storage quota for this document has been exceeded. Please empty your browser\'s cache. Note that this will delete all locally stored data.');
            }
        }
    } else {
        localStorage.removeItem(evt.currentTarget.id);
    }
}
function loadSettings() {
    var i = localStorage.length - 1;
    while (i > -1) {
        var elem = document.getElementById(localStorage.key(i));
        if (elem != null && 'defaultChecked' in elem) {
			elem.dispatchEvent(new MouseEvent('click'));
        }
        i--;
    }
}
function isVisible(element) {
    return (element.className.indexOf('hidden') == -1);
}
function showElement(element) {
    if (element != null) {
        element.classList.toggle('hidden', false);
    }
}
function hideElement(element) {
    if (element != null) {
        element.classList.toggle('hidden', true);
    }
}
function highlightElement(element, state) {
    element.classList.toggle('highlight', state);
}
function toggleDisplayCSS(evt) {
    var e = document.getElementsByClassName(evt.target.getAttribute('data-class'));
    if (evt.target.checked) {
        for (var i = 0, z = e.length; i < z; i++) {
            e[i].classList.toggle('hidden', true);
        }
    } else {
        for (var i = 0, z = e.length; i < z; i++) {
            e[i].classList.toggle('hidden', false);
        }
    }
}
function getConflictingPlugins(filename) {
    /* This would be a C++ function interface, but using a dummy function to test the UI. */
    return ['Skyrim.esm', 'Unofficial Skyrim Patch.esp', 'Wyrmstooth.esp', 'RaceMenu.esp', 'Run For Your Lives.esp'];
}
function togglePlugins(evt) {
    var sections = document.getElementById('main').children;
    var entries = document.getElementById('pluginsNav').children;
    var hiddenPluginNo = 0;
    var hiddenMessageNo = 0;
    if (sections.length - 2 != entries.length) {
        throw "Error: Number of plugins in sidebar doesn't match number of plugins in main area!";
    }
    /* Check if the conflict filter is enabled, and if a plugin has been given. */
    var conflicts = [];
    if (document.getElementById('showOnlyConflicts').checked) {
        var plugin = document.getElementById('conflictsPlugin').value;
        if (plugin.length != 0) {
            conflicts = getConflictingPlugins(plugin);
        }
    }
    /* Start at 3rd section to skip summary and general messages. */
    for (var i = 2; i < sections.length; ++i) {
        var isConflictingPlugin = false;
        var isMessageless = true;
        var hasInactivePluginMessages = false;
        var messages = sections[i].getElementsByTagName('ul')[0].getElementsByTagName('li');
        if (sections[i].getAttribute('data-active') == 'false') {
            hasInactivePluginMessages = true;
        }
        if (conflicts.indexOf(sections[i].getElementsByTagName('h1')[0].textContent) != -1) {
            isConflictingPlugin = true;
        }
        for (var j = 0; j < messages.length; ++j) {
            var hasPluginMessages = false;
            var hasNotes = false;
            var hasDoNotCleanMessages = false;
            if (messages[j].parentElement.parentElement.id != 'generalMessages') {
                hasPluginMessages = true;
            }
            if (messages[j].className.indexOf('say') != -1) {
                hasNotes = true;
            }
            if (messages[j].textContent.indexOf('Do not clean.') != -1) {
                hasDoNotCleanMessages = true;
            }
            if ((document.getElementById('hideAllPluginMessages').checked && hasPluginMessages)
                || (document.getElementById('hideNotes').checked && hasNotes)
                || (document.getElementById('hideDoNotCleanMessages').checked && hasDoNotCleanMessages)
                || (document.getElementById('hideInactivePluginMessages').checked && hasInactivePluginMessages)) {
                hideElement(messages[j]);
                ++hiddenMessageNo;
            } else {
                showElement(messages[j]);
            }
            if (messages[j].className.indexOf('hidden') == -1) {
                isMessageless = false;
                break;
            }
        }
        if ((document.getElementById('hideMessagelessPlugins').checked && isMessageless)
            || conflicts.length > 0 && !isConflictingPlugin) {
            hideElement(sections[i]);
            hideElement(entries[i - 2]);
            ++hiddenPluginNo;
        } else {
            showElement(sections[i]);
            showElement(entries[i - 2]);
        }
    }
	document.getElementById('hiddenMessageNo').textContent = hiddenMessageNo;
    document.getElementById('hiddenPluginNo').textContent = hiddenPluginNo;
}
function closeMessageDialog(evt) {
    var ret = evt.target.returnValue == 'true';

    evt.target.removeEventListener('close', closeMessageDialog, false);
    document.body.removeChild(evt.target);

    if (ret) {

    } else {

    }
}
function showMessageDialog(title, text) {
    var dialog = new MessageDialog();

    dialog.addEventListener('close', closeMessageDialog, false);

    document.body.appendChild(dialog);
    dialog.showModal('warn', title, text);
}
function showMessageBox(type, title, text) {
    var dialog = new MessageDialog();

    dialog.addEventListener('close', closeMessageDialog, false);

    document.body.appendChild(dialog);
    dialog.showModal(type, title, text);
}
function openLogLocation(evt) {
    var request_id = window.cefQuery({
        request: 'openLogLocation',
        persistent: false,
        onSuccess: function(response) {},
        onFailure: function(error_code, error_message) {
            showMessageBox('error', "Error", "Error code: " + error_code + "; " + error_message);
        }
    });
}
function openReadme(evt) {
    // Create and send a new query.
    var request_id = window.cefQuery({
        request: 'openReadme',
        persistent: false,
        onSuccess: function(response) {},
        onFailure: function(error_code, error_message) {
            showMessageBox('error', "Error", "Error code: " + error_code + "; " + error_message);
        }
    });
}
function updateMasterlist(evt) {

}
function sortPlugins(evt) {

}
function applySort(evt) {

}
function cancelSort(evt) {

}
function redatePlugins(evt) {
    showMessageDialog('Redate Plugins', 'This feature is provided so that modders using the Creation Kit may set the load order it uses. A side-effect is that any subscribed Steam Workshop mods will be re-downloaded by Steam. Do you wish to continue?');

    //showMessageBox('info', 'Redate Plugins', 'Plugins were successfully redated.');
}
function copyMetadata(evt) {

}
function clearAllMetadata(evt) {
    showMessageDialog('Clear All Metadata', 'Are you sure you want to clear all existing user-added metadata from all plugins?');
}
function clearMetadata(evt) {
    var filename = evt.target.getAttribute('data-target');
    showMessageDialog('Clear Plugin Metadata', 'Are you sure you want to clear all existing user-added metadata from "' + filename + '"?');
}

function handlePluginDrop(evt) {
    evt.stopPropagation();

    if (evt.currentTarget.tagName == 'TABLE' && (evt.currentTarget.className.indexOf('req') != -1 || evt.currentTarget.className.indexOf('inc') != -1 || evt.currentTarget.className.indexOf('loadAfter') != -1)) {
        var data = {
            file: evt.dataTransfer.getData('text/plain')
        };
        evt.currentTarget.addRow(data);
    }

    return false;
}
function handlePluginDragStart(evt) {
    evt.dataTransfer.effectAllowed = 'copy';
    evt.dataTransfer.setData('text/plain', evt.target.getElementsByClassName('name')[0].textContent);
}
function handlePluginDragOver(evt) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

function areSettingsValid() {
    /* First validate table inputs. */
    var inputs = document.getElementById('settings').getElementsByTagName('input');
    /* If an input is readonly, it doesn't validate, so check required / value length explicitly.
    */
    for (var i = 0; i < inputs.length; ++i) {
        if (inputs[i].readOnly) {
            if (inputs[i].required && inputs[i].value.length == 0) {
                return false;
                console.log(inputs[i]);
                inputs[i].readOnly = false;
            }
        } else if (!inputs[i].checkValidity()) {
            return false;
            console.log(inputs[i]);
        }
    }
    return true;
}
function toggleMenu(evt) {
    var target = document.getElementById('currentMenu');
    if (!target) {
        target = evt.target.firstElementChild;
    }
    if (isVisible(target)) {
        hideElement(target);

        /* Also remove event listeners to any dynamically-generated items. */
        var elements = target.querySelectorAll('[data-action]');
        for (var i = 0; i < elements.length; ++i) {
            var action = elements[i].getAttribute('data-action');
            if (action == 'show-editor') {
                elements[i].removeEventListener('click', showEditor, false);
            } else if (action == 'copy-metadata') {
                elements[i].removeEventListener('click', copyMetadata, false);
            } else if (action == 'clear-metadata') {
                elements[i].removeEventListener('click', clearMetadata, false);
            }
        }

        /* Also add an event listener to the body to close the menu if anywhere is clicked. */
        target.id = '';
        document.body.removeEventListener('click', toggleMenu, false);
    } else {
        showElement(target);

        /* Also attach event listeners to any dynamically-generated items. */
        var elements = target.querySelectorAll('[data-action]');
        for (var i = 0; i < elements.length; ++i) {
            var action = elements[i].getAttribute('data-action');
            if (action == 'show-editor') {
                elements[i].addEventListener('click', showEditor, false);
            } else if (action == 'copy-metadata') {
                elements[i].addEventListener('click', copyMetadata, false);
            } else if (action == 'clear-metadata') {
                elements[i].addEventListener('click', clearMetadata, false);
            }
        }

        /* Also add an event listener to the body to close the menu if anywhere is clicked. */
        target.id = 'currentMenu';
        document.body.addEventListener('click', toggleMenu, false);
        evt.stopPropagation();
    }
}
function toggleFiltersList(evt) {
    var filters = document.getElementById('filters');
    var plugins = document.getElementById('pluginsNav');

    if (isVisible(filters)) {
        hideElement(filters);
        showElement(plugins);
    } else {
        showElement(filters);
        hideElement(plugins);
    }
}

function closeAboutDialog(evt) {
    evt.target.parentElement.close();
}
function showAboutDialog(evt) {
    document.getElementById('about').showModal();
}
function closeSettingsDialog(evt) {
    if (!areSettingsValid()) {
        evt.preventDefault();
        return;
    }

    if (evt.target.returnValue == 'true') {

    } else {

    }
}

function showSettingsDialog(evt) {
    document.getElementById('settings').showModal();
}
function toggleInputRO(evt) {
    if (evt.target.readOnly) {
        evt.target.removeAttribute('readonly');
    } else {
        evt.target.setAttribute('readonly', '');
    }
}
function toggleHoverText(evt) {
    /*if (evt.target.id = 'hoverText') {
        evt.stopPropagation();
        return;
    }*/
    var hoverText = document.getElementById('hoverText');
    if (isVisible(hoverText) && evt.target != hoverText && evt.target.id != hoverText.getAttribute('hoverTarget')) {
        hideElement(hoverText);
    } else {
        if (evt.target.hasAttribute('title')) {
            var id;
            if (evt.target.id) {
                id = evt.target.id;
            } else {
                id = 'hoverTarget';
                evt.target.id = id;
            }
            hoverText.setAttribute('hoverTarget', id);

            hoverText.textContent = evt.target.getAttribute('title');
            hoverText.style.left = evt.clientX + 'px';
            hoverText.style.top = (20 + evt.clientY) + 'px';
            showElement(hoverText);
        }
    }
}
function setupEventHandlers() {
    var elements;
    if (isStorageSupported()) { /*Set up filter value and CSS setting storage read/write handlers.*/
        elements = document.getElementById('filters').getElementsByTagName('input');
        for (var i = 0; i < elements.length; ++i) {
            elements[i].addEventListener('click', saveCheckboxState, false);
        }
    }
    /*Set up handlers for filters.*/
    document.getElementById('hideVersionNumbers').addEventListener('click', toggleDisplayCSS, false);
    document.getElementById('hideCRCs').addEventListener('click', toggleDisplayCSS, false);
    document.getElementById('hideBashTags').addEventListener('click', toggleDisplayCSS, false);
    document.getElementById('hideNotes').addEventListener('click', togglePlugins, false);
    document.getElementById('hideDoNotCleanMessages').addEventListener('click', togglePlugins, false);
    document.getElementById('hideInactivePluginMessages').addEventListener('click', togglePlugins, false);
    document.getElementById('hideAllPluginMessages').addEventListener('click', togglePlugins, false);
    document.getElementById('hideMessagelessPlugins').addEventListener('click', togglePlugins, false);
    document.getElementById('showOnlyConflicts').addEventListener('click', togglePlugins, false);

    /* Set up handlers for buttons. */
    document.getElementById('fileMenu').addEventListener('click', toggleMenu, false);
    document.getElementById('redatePluginsButton').addEventListener('click', redatePlugins, false);
    document.getElementById('openLogButton').addEventListener('click', openLogLocation, false);
    document.getElementById('wipeUserlistButton').addEventListener('click', clearAllMetadata, false);
    document.getElementById('gameMenu').addEventListener('click', toggleMenu, false);
    document.getElementById('settingsButton').addEventListener('click', showSettingsDialog, false);
    document.getElementById('helpMenu').addEventListener('click', toggleMenu, false);
    document.getElementById('helpButton').addEventListener('click', openReadme, false);
    document.getElementById('aboutButton').addEventListener('click', showAboutDialog, false);
    document.getElementById('updateMasterlistButton').addEventListener('click', updateMasterlist, false);
    document.getElementById('sortButton').addEventListener('click', sortPlugins, false);
    document.getElementById('applySortButton').addEventListener('click', applySort, false);
    document.getElementById('cancelSortButton').addEventListener('click', cancelSort, false);
    document.getElementById('filtersToggle').addEventListener('click', toggleFiltersList, false);

    /* Set up event handlers for settings dialog. */
    var settings = document.getElementById('settings');
    settings.addEventListener('close', closeSettingsDialog, false);
    settings.addEventListener('cancel', closeSettingsDialog, false);

    settings.getElementsByClassName('accept')[0].addEventListener('click', function(evt){
        evt.target.parentElement.parentElement.close(true);
    }, false);
    settings.getElementsByClassName('cancel')[0].addEventListener('click', function(evt){
        evt.target.parentElement.parentElement.close(false);
    }, false);

    /* Set up about dialog handlers. */

    document.getElementById('about').getElementsByTagName('button')[0].addEventListener('click', closeAboutDialog, false);


    /* Set up event handler for hover text. */
    document.body.addEventListener('mouseover', toggleHoverText, false);
}
function processCefError(errorCode, errorMessage) {
    showMessageBox('error', "Error", "Error code: " + error_code + "; " + error_message);
}
function initGlobalVars() {
    // Create and send a new query.
    var request_id = window.cefQuery({
        request: 'getVersion',
        persistent: false,
        onSuccess: function(response) {
            try {
                loot.version = JSON.parse(response);

                document.getElementById('LOOTVersion').textContent = loot.version;
            } catch (e) {
                console.log(e);
                console.log('Response: ' + response);
            }
        },
        onFailure: processCefError
    });
    var request_id = window.cefQuery({
        request: 'getLanguages',
        persistent: false,
        onSuccess: function(response) {
            try {
                loot.languages = JSON.parse(response);

                /* Now fill in language options. */
                var settingsLangSelect = document.getElementById('languageSelect');
                var messageLangSelect = document.getElementById('messageRow').content.querySelector('.language');
                for (var i = 0; i < loot.languages.length; ++i) {
                    var option = document.createElement('option');
                    option.value = loot.languages[i].locale;
                    option.textContent = loot.languages[i].name;
                    settingsLangSelect.appendChild(option);
                    messageLangSelect.appendChild(option.cloneNode(true));
                }
            } catch (e) {
                console.log(e);
                console.log('Response: ' + response);
            }
        },
        onFailure: processCefError
    });
    var request_id = window.cefQuery({
        request: 'getGameTypes',
        persistent: false,
        onSuccess: function(response) {
            try {
                loot.gameTypes = JSON.parse(response);

                /* Fill in game row template's game type options. */
                var select = document.getElementById('gameRow').content.querySelector('select');
                for (var j = 0; j < loot.gameTypes.length; ++j) {
                    var option = document.createElement('option');
                    option.value = loot.gameTypes[j];
                    option.textContent = loot.gameTypes[j];
                    select.appendChild(option);
                }
            } catch (e) {
                console.log(e);
                console.log('Response: ' + response);
            }

            // Settings depend on having the game types filled, so now send the CEF query for the settings.
            var request_id = window.cefQuery({
                request: 'getSettings',
                persistent: false,
                onSuccess: function(response) {
                    try {
                        loot.settings = JSON.parse(response);


                        /* Now fill game lists/table. */
                        var gameSelect = document.getElementById('defaultGameSelect');
                        var gameMenu = document.getElementById('gameMenu').firstElementChild;
                        var gameTable = document.getElementById('gameTable');
                        for (var i = 0; i < loot.settings.games.length; ++i) {
                            var option = document.createElement('option');
                            option.value = loot.settings.games[i].folder;
                            option.textContent = loot.settings.games[i].name;
                            gameSelect.appendChild(option);

                            var li = document.createElement('li');
                            li.setAttribute('data-action', 'change-game');
                            li.setAttribute('data-target', loot.settings.games[i].folder);
                            li.textContent = loot.settings.games[i].name;
                            gameMenu.appendChild(li);

                            gameTable.addRow(loot.settings.games[i]);
                        }

                        gameSelect.value = loot.settings.game;
                        document.getElementById('languageSelect').value = loot.settings.language;
                        document.getElementById('debugVerbositySelect').value = loot.settings.debugVerbosity;
                    } catch (e) {
                        console.log(e);
                        console.log('Response: ' + response);
                    }

                },
                onFailure: processCefError
            });
        },
        onFailure: processCefError
    });
}
function getPriorityString(plugin) {

}
function getTagsStrings(plugin) {
}

function updateInterfaceWithGameInfo(response) {

    try {
        loot.game = JSON.parse(response, jsonToPlugin);
    } catch (e) {
        console.log(e);
        console.log('Response: ' + response);
    }

    var totalMessageNo = 0;
    var warnMessageNo = 0;
    var errorMessageNo = 0;
    var activePluginNo = 0;
    var dirtyPluginNo = 0;

    /* Fill report with data. */
    document.getElementById('masterlistRevision').textContent = loot.game.masterlist.revision;
    document.getElementById('masterlistDate').textContent = loot.game.masterlist.date;

    var generalMessagesList = document.getElementById('generalMessages').getElementsByTagName('ul')[0];
    for (var i = 0; i < loot.game.globalMessages.length; ++i) {
        var li = document.createElement('li');
        li.className = loot.game.globalMessages[i].type;
        /* Use the Marked library for Markdown formatting support. */
        li.innerHTML = marked(loot.game.globalMessages[i].content[0].str);
        generalMessagesList.appendChild(li);

        if (li.className == 'warn') {
            warnMessageNo++;
        } else if (li.className == 'error') {
            errorMessageNo++;
        }
    }
    totalMessageNo = loot.game.globalMessages.length;
    var pluginsList = document.getElementById('main');
    var pluginsNav = document.getElementById('pluginsNav');
    loot.game.plugins.forEach(function(plugin) {

        if (plugin.isActive) {
            ++activePluginNo;
        }

        if (plugin.isDirty) {
            ++dirtyPluginNo;
        }

        if (plugin.messages && plugin.messages.length != 0) {
            plugin.messages.forEach(function(message) {

                if (message.type == 'warn') {
                    warnMessageNo++;
                } else if (message.type == 'error') {
                    errorMessageNo++;
                }
                totalMessageNo++;
            });
        }
    });
    document.getElementById('filterTotalMessageNo').textContent = totalMessageNo;
    document.getElementById('totalMessageNo').textContent = totalMessageNo;
    document.getElementById('totalWarningNo').textContent = warnMessageNo;
    document.getElementById('totalErrorNo').textContent = errorMessageNo;
    document.getElementById('filterTotalPluginNo').textContent = loot.game.plugins.length;
    document.getElementById('totalPluginNo').textContent = loot.game.plugins.length;
    document.getElementById('activePluginNo').textContent = activePluginNo;
    document.getElementById('dirtyPluginNo').textContent = dirtyPluginNo;

    // Now set up event handlers, as they depend on the plugin cards having been created.
    setupEventHandlers();
}
function getGameData() {
    // Create and send a new query.
    var request_id = window.cefQuery({
        request: 'getGameData',
        persistent: false,
        onSuccess: updateInterfaceWithGameInfo,
        onFailure: function(error_code, error_message) {
            showMessageBox('error', "Error", "Error code: " + error_code + "; " + error_message);
        }
    });
}

require.config({
    baseUrl: "js",
  });
require(['marked', 'order!custom', 'order!plugin'], function(response) {
    marked = response;
    /* Make sure settings are what I want. */
    marked.setOptions({
        gfm: true,
        tables: true,
        sanitize: true
    });
    initGlobalVars();
    getGameData();
    if (isStorageSupported()) {
        loadSettings();
    }
});
