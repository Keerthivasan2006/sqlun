document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    const emailInput = document.getElementById('email'); // ✅ now matches HTML // changed from mobile
    const otpField = document.getElementById('otp-field');
    const otpInput = document.getElementById('otp');

    // Email validation
    emailInput.addEventListener('input', function () {
        // Optional: strip spaces
        this.value = this.value.replace(/\s/g, '');
    });

    otpInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Login/OTP flow
    loginBtn.addEventListener('click', async function () {
        const email = emailInput.value.trim();

        if (!otpField.style.display || otpField.style.display === 'none') {
            // First step - Send OTP
            if (!validateEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }

            // Show loading state
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP';
            loginBtn.disabled = true;

            try {
                // Call backend API to send OTP via email
                const response = await sendOTP(email);

                if (response.success) {
                    showSuccess(`OTP sent to ${email}`);
                    otpField.style.display = 'block';
                    loginBtn.textContent = 'Verify OTP';
                    emailInput.readOnly = true;
                } else {
                    showError(response.message || 'Failed to send OTP');
                }
            } catch (error) {
                showError('Error sending OTP. Please try again.');
            } finally {
                loginBtn.innerHTML = 'Verify OTP';
                loginBtn.disabled = false;
            }
        } else {
            // Second step - Verify OTP
            const otp = otpInput.value.trim();

            if (otp.length !== 6) {
                showError('Please enter the 6-digit OTP');
                return;
            }

            // Show loading state
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying';
            loginBtn.disabled = true;

            try {
                const response = await verifyOTP(email, otp);

                if (response.success) {
                    showSuccess('Login successful! Redirecting...');
                    setTimeout(() => {
                        localStorage.setItem('userAuthToken', response.token || 'demo-token');
                        localStorage.setItem('userEmail', email);

                        if (response.isNewUser) {
                            window.location.href = 'complete-profile.html';
                        } else {
                            window.location.href = 'dashboard.html';
                        }
                    }, 1500);
                } else {
                    showError(response.message || 'Invalid OTP. Please try again.');
                }
            } catch (error) {
                showError('Error verifying OTP. Please try again.');
            } finally {
                loginBtn.innerHTML = 'Verify OTP';
                loginBtn.disabled = false;
            }
        }
    });

    // Mock functions - Replace with backend
    async function sendOTP(email) {
    const res = await fetch('http://localhost:5000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return res.json();
}

async function verifyOTP(email, otp) {
    const res = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });
    return res.json();
}


    function generateAuthToken() {
        return 'token-' + Math.random().toString(36).substr(2) +
            '-' + Date.now().toString(36);
    }

    // Helper
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        errorEl.style.color = 'var(--danger)';
        errorEl.style.marginTop = '10px';
        errorEl.style.fontSize = '14px';
        errorEl.style.textAlign = 'center';

        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();

        loginBtn.parentNode.insertBefore(errorEl, loginBtn.nextSibling);

        setTimeout(() => {
            errorEl.style.opacity = '0';
            setTimeout(() => errorEl.remove(), 300);
        }, 3000);
    }

    function showSuccess(message) {
        const successEl = document.createElement('div');
        successEl.className = 'success-message';
        successEl.textContent = message;
        successEl.style.color = 'var(--success)';
        successEl.style.marginTop = '10px';
        successEl.style.fontSize = '14px';
        successEl.style.textAlign = 'center';

        const existingSuccess = document.querySelector('.success-message');
        if (existingSuccess) existingSuccess.remove();

        loginBtn.parentNode.insertBefore(successEl, loginBtn.nextSibling);

        setTimeout(() => {
            successEl.style.opacity = '0';
            setTimeout(() => successEl.remove(), 300);
        }, 3000);
    }
});
