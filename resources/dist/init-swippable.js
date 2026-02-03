// Initialize swippable notification on all Filament notifications (both popup and database)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSwippableNotifications);
} else {
    initializeSwippableNotifications();
}

// Watch for dynamically added notifications
const observer = new MutationObserver((mutations) => {
    let hasNewNotifications = false;
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    // Check for popup toast notifications
                    if (node.matches('.fi-no-notification')) {
                        hasNewNotifications = true;
                    }
                    if (node.querySelectorAll && node.querySelectorAll('.fi-no-notification').length > 0) {
                        hasNewNotifications = true;
                    }

                    // Check for database notifications in modal
                    if (node.querySelector && node.querySelector('[x-data*="notificationComponent"]')) {
                        hasNewNotifications = true;
                    }
                }
            });
        }
    });
    if (hasNewNotifications) {
        initializeSwippableNotifications();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});

function initializeSwippableNotifications() {
    // Target BOTH:
    // 1. Popup toast notifications (.fi-no-notification)
    // 2. Database notifications inside modal ([x-data*="notificationComponent"])
    const toastNotifications = document.querySelectorAll('.fi-no-notification:not([data-swippable-initialized])');
    const databaseNotifications = document.querySelectorAll('[x-data*="notificationComponent"]:not([data-swippable-initialized])');

    const allNotifications = [...toastNotifications, ...databaseNotifications];

    allNotifications.forEach((notification) => {
        notification.setAttribute('data-swippable-initialized', 'true');

        // Create swipe handler object for this notification
        const swipeHandler = {
            startX: 0,
            startY: 0,
            isDragging: false,
            currentX: 0,
            threshold: 80, // pixels to trigger close
            el: notification,
            isToastNotification: notification.classList.contains('fi-no-notification'),

            start(clientX, clientY, target) {
                // Don't start swipe on interactive elements
                if (this.isClickable(target)) return false;
                this.startX = clientX;
                this.startY = clientY;
                this.isDragging = true;
                this.el.classList.add('swippable-notification-dragging');
                this.el.style.cursor = 'grabbing';
                return true;
            },

            move(clientX) {
                if (!this.isDragging) return;
                this.currentX = clientX - this.startX;
                // Apply transform and opacity while dragging
                this.el.style.transform = `translateX(${this.currentX}px)`;
                this.el.style.opacity = `${Math.max(0, 1 - Math.abs(this.currentX) / 300)}`;
            },

            end() {
                if (!this.isDragging) return;
                this.isDragging = false;
                this.el.style.cursor = '';
                this.checkAndClose();
            },

            isClickable(element) {
                // Check if element or any parent is interactive
                const clickableElements = element.closest('button, a, [role="button"], [role="menuitem"], input, textarea, select');
                return !!clickableElements;
            },

            checkAndClose() {
                const absDiff = Math.abs(this.currentX);
                // If swiped more than threshold, close the notification
                if (absDiff > this.threshold) {
                    this.close();
                } else {
                    // Otherwise reset to original position
                    this.reset();
                }
            },

            reset() {
                // Animate back to original position
                this.el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                this.el.style.transform = '';
                this.el.style.opacity = '';
                this.el.classList.remove('swippable-notification-dragging');
                // Remove transition after animation completes
                setTimeout(() => {
                    this.el.style.transition = '';
                }, 300);
            },

            close() {
                this.el.classList.add('swippable-notification-closing');
                const direction = this.currentX > 0 ? 1 : -1;
                this.el.style.transform = `translateX(${direction * 120}%)`;
                this.el.style.opacity = '0';
                this.el.style.pointerEvents = 'none';

                // Close the notification after animation
                setTimeout(() => {
                    if (this.isToastNotification) {
                        // For toast notifications: trigger close button
                        const closeBtn = this.el.querySelector(
                            '.fi-no-notification-close-btn, ' +
                            'button[aria-label*="Close" i], ' +
                            'button[title*="close" i], ' +
                            'button[class*="close"]'
                        );
                        if (closeBtn && closeBtn.click) {
                            closeBtn.click();
                        } else {
                            this.el.remove();
                        }
                    } else {
                        // For database notifications: dispatch Alpine event or trigger close
                        const closeBtn = this.el.closest('.fi-no-database')?.querySelector('.fi-btn-close');
                        if (closeBtn && closeBtn.click) {
                            closeBtn.click();
                        } else if (this.el.__x && this.el.__x.$data && this.el.__x.$data.close) {
                            // Alpine component close method
                            this.el.__x.$data.close();
                        } else {
                            this.el.remove();
                        }
                    }
                }, 300);
            }
        };

        // Touch events (mobile)
        notification.addEventListener('touchstart', (e) => {
            if (swipeHandler.start(e.touches[0].clientX, e.touches[0].clientY, e.target)) {
                e.preventDefault();
            }
        }, { passive: false });

        notification.addEventListener('touchmove', (e) => {
            if (swipeHandler.isDragging) {
                swipeHandler.move(e.touches[0].clientX);
                e.preventDefault();
            }
        }, { passive: false });

        notification.addEventListener('touchend', () => swipeHandler.end(), false);
        notification.addEventListener('touchcancel', () => swipeHandler.reset(), false);

        // Mouse events (desktop)
        notification.addEventListener('mousedown', (e) => {
            if (swipeHandler.start(e.clientX, e.clientY, e.target)) {
                e.preventDefault();
            }
        }, false);

        notification.addEventListener('mousemove', (e) => {
            if (swipeHandler.isDragging) {
                swipeHandler.move(e.clientX);
            }
        }, false);

        notification.addEventListener('mouseup', () => swipeHandler.end(), false);
        notification.addEventListener('mouseleave', () => swipeHandler.reset(), false);
    });
}
