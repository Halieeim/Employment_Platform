document.getElementById('jobForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const jobData = {
        "title": document.getElementById('title').value,
        "location": document.getElementById('location').value,
        "experience_level": document.getElementById('experience').value,
        "company": document.getElementById('company').value,
        "description": document.getElementById('description').value
    };

    try {
        const response = await fetch('/postnewjob', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jobData)
        });

        if (response.ok) {
            alert('Job posted successfully!');
            window.location.href = '/dashboard';
        } else {
            alert(`Failed to post job. Please try again.\n ${response.json}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to post job. Please try again.');
    }
});