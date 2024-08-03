document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const nationalId = document.getElementById('nationalId').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const company = document.getElementById('company').value;
    const city = document.getElementById('city').value;
    const experienceLevel = document.getElementById('experienceLevel').value;

    const data = {
        "national_id": nationalId,
        "name": name,
        "city": city,
        "email": email,
        "company": company,
        "experience_level": experienceLevel
    }

    // validation
    if (nationalId && name && email && company && city && experienceLevel) {
        const alreadyExistsResponse = await fetch(`/employer/${nationalId}`);
        if(alreadyExistsResponse.status === 200 || alreadyExistsResponse.status === 201){
            alert("An employer with this national id already exists. Enter another id.");
        }
        else{
            try {
                const response = await fetch('/registeremployer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
    
                if (response.ok) {
                    const authenticationResponse = await fetch("/authenticate", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ "national_id": nationalId, "role": "Employer" })
                    })
                    if(authenticationResponse.ok){
                        alert('Sign-up successful!. You are now logged in.');
                        window.location.href = "/dashboard";
                    }
                    else{
                        console.log(authenticationResponse.status);
                        alert("Enrolled in database, but authentication failed!!!");
                    }
                } else {
                    alert("SignUp has failed!!!. Try Again");
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        }
    } else {
        alert('Please fill in all fields.');
    }
});
