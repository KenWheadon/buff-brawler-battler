// In-game notification system
// Replaces browser alerts/confirms with styled in-game popups

/**
 * Show an in-game notification
 * @param {Object} options - Notification options
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.type - Type: 'info', 'success', 'error', 'warning'
 * @param {Array} options.buttons - Array of button configs: [{text: 'OK', onClick: fn, primary: true}]
 * @param {number} options.duration - Auto-close duration in ms (0 = no auto-close)
 */
function showNotification(options) {
    const {
        title = '',
        message = '',
        type = 'info',
        buttons = [{text: 'OK', primary: true}],
        duration = 0
    } = options;

    // Remove any existing notifications
    const existingOverlay = document.querySelector('.notification-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';

    // Create notification
    const notification = document.createElement('div');
    notification.className = `game-notification ${type}`;

    // Add title if provided
    if (title) {
        const titleElement = document.createElement('div');
        titleElement.className = 'game-notification-title';
        titleElement.textContent = title;
        notification.appendChild(titleElement);
    }

    // Add message
    const messageElement = document.createElement('div');
    messageElement.className = 'game-notification-message';
    messageElement.innerHTML = message; // Allow HTML for formatting
    notification.appendChild(messageElement);

    // Add buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'game-notification-buttons';

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = btn.primary ? 'btn btn-primary' : 'btn btn-secondary';
        button.textContent = btn.text;
        button.onclick = () => {
            closeNotification(overlay, notification);
            if (btn.onClick) btn.onClick();
        };
        buttonsContainer.appendChild(button);
    });

    notification.appendChild(buttonsContainer);

    // Add to DOM
    document.body.appendChild(overlay);
    document.body.appendChild(notification);

    // Auto-close if duration is set
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(overlay, notification);
        }, duration);
    }

    // Allow clicking overlay to close
    overlay.onclick = () => {
        closeNotification(overlay, notification);
    };
}

/**
 * Close a notification with animation
 */
function closeNotification(overlay, notification) {
    notification.classList.add('fadeout');
    setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.remove();
        if (notification && notification.parentNode) notification.remove();
    }, 200);
}

/**
 * Show a simple info notification
 */
function showInfo(message, duration = 2000) {
    showNotification({
        type: 'info',
        message: message,
        buttons: [],
        duration: duration
    });
}

/**
 * Show a success notification
 */
function showSuccess(title, message, duration = 2500) {
    showNotification({
        title: title,
        type: 'success',
        message: message,
        buttons: duration === 0 ? [{text: 'OK', primary: true}] : [],
        duration: duration
    });
}

/**
 * Show an error notification
 */
function showError(title, message) {
    showNotification({
        title: title,
        type: 'error',
        message: message,
        buttons: [{text: 'OK', primary: true}]
    });
}

/**
 * Show a warning notification
 */
function showWarning(title, message) {
    showNotification({
        title: title,
        type: 'warning',
        message: message,
        buttons: [{text: 'OK', primary: true}]
    });
}
