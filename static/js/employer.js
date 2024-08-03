document.getElementById('signinForm2').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission
    const USER_EMPLOYER_NATIONAL_ID = document.getElementById('employernationalId').value;

    if (USER_EMPLOYER_NATIONAL_ID) {
        try {
            const response = await fetch(`/employer/${USER_EMPLOYER_NATIONAL_ID}`);
            if (response.ok) {
                const authenticationResponse = await fetch("/authenticate", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ "national_id": USER_EMPLOYER_NATIONAL_ID, "role": "Employer" })
                });
                if(authenticationResponse.ok){
                    alert("You are logged in Successfully!!!");
                    window.location.href = "/dashboard";
                }
            } else {
                alert('Employer not found.');
            }
        } catch (error) {
            alert('Error checking employer. Please try again.');
        }
    } else {
        alert('Please enter your National ID.');
    }
});
