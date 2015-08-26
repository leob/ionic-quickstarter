// Test the login experience
describe('Login', function(){
        
        beforeEach(function() {
                // before each spec, load the login page
                browser.get('/#/login');
        });
        
        it('should fail with an appropriate error message when password is invalid', function() {
                // Enter an invalid password and try to log in
                element(by.name('email')).sendKeys('someone@example.com');
                element(by.name('password')).sendKeys('badpassword');
                element(by.name('login')).click();
                
                // We should see an error message about the invalid password
                var errorDisplay = element(by.css(".form-errors"));
                expect(errorDisplay.getText()).toContain('Invalid');
        });
        
        it('should log in and go to home when a valid password is entered', function() {
                // Enter a valid password, and try to log in
                element(by.name('email')).sendKeys('someone@example.com');
                element(by.name('password')).sendKeys('password');
                element(by.name('login')).click();
                
                // We should navigate to the app (home or intro if it is first use)
                // on successful sign-in
                expect(browser.getLocationAbsUrl()).toContain('/app/');
                
                // Test logout experience
                describe('Logout', function() {
                        
                        it('should be able to log out after a successful login', function() {
                                // Click the logout button
                                element(by.name('logout')).click();
                                
                                // We should now go to the logged out screen
                                expect(browser.getLocationAbsUrl()).toContain('/loggedout');
                        });
                });
        });
});