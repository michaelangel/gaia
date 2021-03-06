'use strict';

// remove this when https://github.com/visionmedia/mocha/issues/819 is merged in
// mocha and when we have that new mocha in test agent
mocha.setup({ globals: [ 'alert' ] });

requireApp('sms/test/unit/mock_utils.js');
requireApp('sms/test/unit/mock_alert.js');
requireApp('sms/test/unit/mock_l10n.js');
requireApp('sms/test/unit/mock_navigatormoz_sms.js');
requireApp('sms/js/thread_ui.js');

var mocksHelperForThreadUI = new MocksHelper([
  'Utils',
  'alert'
]);

mocksHelperForThreadUI.init();

suite('thread_ui.js >', function() {
  var container;
  var sendButton;
  var input;
  var composeForm;

  var realMozL10n;

  var mocksHelper = mocksHelperForThreadUI;

  suiteSetup(function() {
    mocksHelper.suiteSetup();

    realMozL10n = navigator.mozL10n;
    navigator.mozL10n = MockL10n;
  });

  suiteTeardown(function() {
    navigator.mozL10n = realMozL10n;
    mocksHelper.suiteTeardown();
  });

  setup(function() {
    mocksHelper.setup();

    container = document.createElement('section');
    container.id = 'thread-messages';
    container.className = 'panel';

    var additionalMarkup =
      '<a role="link" id="messages-back-button">' +
      '  <span class="icon icon-back"></span>' +
      '</a>' +
      '<a id="messages-contact-pick-button">' +
      '  <span class="icon icon-user"></span>' +
      '</a>' +
      '<a href="#edit" id="icon-edit">' +
      '  <span class="icon icon-edit"></span>' +
      '</a>' +
      '<h1 id="messages-header-text">Messages</h1>' +
      '<form id="messages-tel-form">' +
      '  <input id="messages-recipient" type="text" name="tel" class="tel" />' +
      '  <span id="messages-clear-button" role="button"' +
      '    class="icon icon-clear"></span>' +
      '</form>' +
      '<article id="messages-container" class="view-body" data-type="list">' +
      '</article>' +
      '<form role="search" id="messages-compose-form" ' +
      '  class="bottom messages-compose-form">' +
      '  <button id="messages-send-button" disabled' +
      '    type="submit">Send</button>' +
      '  <p>' +
      '    <textarea type="text" id="messages-input" name="messages-input" ' +
      '      placeholder="Message"></textarea>' +
      '  </p>' +
      '</form>' +
      '<form role="dialog" id="messages-edit-form" data-type="edit" >' +
      '  <button id="messages-cancel-button">' +
      '    <span class="icon icon-close">close</span>' +
      '  </button>' +
      '  <button id="messages-delete-button">delete</button>' +
      '  <button id="messages-uncheck-all-button" disabled' +
      '    class="edit-button">' +
      '  </button>' +
      '  <button id="messages-check-all-button" class="edit-button">' +
      '  </button>' +
      '</form>';

    container.insertAdjacentHTML('beforeend', additionalMarkup);

    sendButton = container.querySelector('#messages-send-button');
    input = container.querySelector('#messages-input');
    composeForm = container.querySelector('#messages-compose-form');

    document.body.appendChild(container);

    ThreadUI._mozSms = MockNavigatormozSms;

    ThreadUI.init();
  });

  teardown(function() {
    container.parentNode.removeChild(container);
    container = null;

    MockNavigatormozSms.mTeardown();
    mocksHelper.teardown();
  });

  suite('updateCounter() >', function() {
    suite('in first segment >', function() {
      setup(function() {
        MockNavigatormozSms.mNextSegmentInfo = {
          segments: 1,
          charsAvailableInLastSegment: 20
        };

        ThreadUI.updateCounter();
      });

      test('no counter is displayed', function() {
        assert.equal(sendButton.dataset.counter, '');
      });

      test('the user can enter more characters', function() {
        assert.equal(input.maxLength, -1);
      });

      test('no alert is sent', function() {
        assert.isNull(Mockalert.mLastMessage);
      });
    });

    suite('in first segment, less than 10 chars left >', function() {
      var segment = 1,
          availableChars = 10;

      setup(function() {
        MockNavigatormozSms.mNextSegmentInfo = {
          segments: segment,
          charsAvailableInLastSegment: availableChars
        };

        ThreadUI.updateCounter();
      });

      test('a counter is displayed', function() {
        var expected = availableChars + '/' + segment;
        assert.equal(sendButton.dataset.counter, expected);
      });

      test('the user can enter more characters', function() {
        assert.equal(input.maxLength, -1);
      });

      test('no alert is sent', function() {
        assert.isNull(Mockalert.mLastMessage);
      });
    });

    suite('in second segment >', function() {
      var segment = 2,
          availableChars = 20;

      setup(function() {
        MockNavigatormozSms.mNextSegmentInfo = {
          segments: segment,
          charsAvailableInLastSegment: availableChars
        };

        ThreadUI.updateCounter();
      });

      test('a counter is displayed', function() {
        var expected = availableChars + '/' + segment;
        assert.equal(sendButton.dataset.counter, expected);
      });

      test('the user can enter more characters', function() {
        assert.equal(input.maxLength, -1);
      });

      test('no alert is sent', function() {
        assert.isNull(Mockalert.mLastMessage);
      });
    });

    suite('in last segment >', function() {
      var segment = 10,
          availableChars = 20;

      setup(function() {
        MockNavigatormozSms.mNextSegmentInfo = {
          segments: segment,
          charsAvailableInLastSegment: availableChars
        };

        ThreadUI.updateCounter();
      });

      test('a counter is displayed', function() {
        var expected = availableChars + '/' + segment;
        assert.equal(sendButton.dataset.counter, expected);
      });

      test('the user can enter more characters', function() {
        assert.equal(input.maxLength, -1);
      });

      test('no alert is sent', function() {
        assert.isNull(Mockalert.mLastMessage);
      });
    });

    suite('in last segment, no characters left >', function() {
      var segment = 10,
          availableChars = 0;

      setup(function() {
        MockNavigatormozSms.mNextSegmentInfo = {
          segments: segment,
          charsAvailableInLastSegment: availableChars
        };

        ThreadUI.updateCounter();
      });

      test('a counter is displayed', function() {
        var expected = availableChars + '/' + segment;
        assert.equal(sendButton.dataset.counter, expected);
      });

      test('the user can not enter more characters', function() {
        assert.equal(input.maxLength, input.value.length);
      });

      test('an alert is sent', function() {
        assert.equal(Mockalert.mLastMessage, 'messages-max-length-notice');
      });
    });
  });
});
