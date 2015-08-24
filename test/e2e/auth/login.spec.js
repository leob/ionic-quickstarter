// Test the login experience
describe('Login', function(){
        
        beforeEach(function() {
                // before each spec, load the login page
                browser.get('/#/login');
        });
        
        it('should fail with invalid password', function() {
                // Enter an invalid password and try to log in
                element(by.name('email')).sendKeys('someone@example.com');
                element(by.name('password')).sendKeys('badpassword');
                element(by.name('login')).click();
                
                // We should see an error message about the invalid password
                var errorDisplay = element(by.css(".form-error"));
                expect(errorDisplay.getText()).toContain('invalid');
        });
});