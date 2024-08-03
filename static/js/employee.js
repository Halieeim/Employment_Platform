document.getElementById('signinForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission
    const USER_EMPLOYEE_NATIONAL_ID = document.getElementById('nationalId').value;
    
    if (USER_EMPLOYEE_NATIONAL_ID) {
        try {
            const response = await fetch(`/employee/${USER_EMPLOYEE_NATIONAL_ID}`);
            if (response.ok) {
                const authenticationResponse = await fetch("/authenticate", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ "national_id": USER_EMPLOYEE_NATIONAL_ID, "role": "Employee" })
                });
                if(authenticationResponse.ok){
                    alert("You are logged in Successfully!!!");
                    window.location.href = "/dashboard";
                }
            } else {
                alert('Employee with this national id does not exist.');
            }
        } catch (error) {
            alert('Error checking employee. Please try again.');
        }
    } else {
        alert('Please enter your National ID.');
    }
});
