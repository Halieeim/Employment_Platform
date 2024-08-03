document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const nationalId = document.getElementById('nationalId').value;
    const name = document.getElementById('name').value;
    const city = document.getElementById('city').value;
    const email = document.getElementById('email').value;
    const experienceLevel = document.getElementById('experienceLevel').value;
    const biography = document.getElementById('biography').value;
    const languages = document.getElementById('programmingLanguages').value;

    const data = {
        "national_id": nationalId,
        "name": name,
        "city": city,
        "email": email,
        "bio": biography,
        "experience_level": experienceLevel,
        "languages": languages
    }

    // validation
    if (nationalId) {
        const alreadyExistsResponse = await fetch(`/employee/${nationalId}`);
        if(alreadyExistsResponse.status === 200 || alreadyExistsResponse.status === 201){
            alert("An employee with this national id already exists. Enter another id.");
        }
        else{
            try{
                const response = await fetch("/registeremployee", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if(response.ok){
                    const authenticationResponse = await fetch("/authenticate", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ "national_id": nationalId, "role": "Employee" })
                    })
                    if(authenticationResponse.ok){
                        alert('Sign-up successful!. You are now logged in.');
                        window.location.href = "/dashboard";
                    }
                    else{
                        console.log(authenticationResponse.status);
                        alert("Enrolled in database, but authentication failed!!!");
                    }
                }
                else {
                    alert("SignUp has failed!!!. Try Again");
                }
            } catch (error) {
                console.error("Error: ", error);
                alert('An error occurred. Please try again.');
            }
            

        }
    } else {
        alert('Please fill in all fields.');
    }
});
