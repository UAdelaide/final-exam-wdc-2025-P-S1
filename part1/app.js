
app.get('/api/dogs', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT
                d.name as dog_name,
                d.size,
                u.username as owner_username
            FROM Dogs d
            JOIN Users u ON d.owner_id = u.user_id
            ORDER BY d.name
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error retrieving dogs:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve data from dogs'
        });
    }
});


app.get('/api/walkrequests/open', async (req, res) => {
    try {

        const sqlQuery = `
            SELECT
                walkReq.request_id,
                dogInfo.name as dog_name,
                walkReq.requested_time,
                walkReq.duration_minutes,
                walkReq.location,
                ownerInfo.username as owner_username
            FROM WalkRequests walkReq
            INNER JOIN Dogs dogInfo ON walkReq.dog_id = dogInfo.dog_id
            INNER JOIN Users ownerInfo ON dogInfo.owner_id = ownerInfo.user_id
            WHERE walkReq.status = 'open'
            ORDER BY walkReq.requested_time ASC, dogInfo.name ASC
        `;


        const [queryResults] = await db.execute(sqlQuery);


        res.status(200).json(queryResults);

    } catch (dbError) {

        console.error('Database query failed for open walk requests:', dbError);


        res.status(500).json({
            error: 'Database operation failed',
            message: 'Unable to retrieve open walk requests',
            timestamp: new Date().toISOString()
        });
    }
});


app.get('/api/walkers/summary', async (req, res) => {
    try {
        const query = `
            SELECT
                u.username as walker_username,
                COUNT(wr.rating_id) as total_ratings,
                AVG(wr.rating) as average_rating,
                COUNT(DISTINCT wa.request_id) as completed_walks
            FROM Users u
            LEFT JOIN WalkApplications wa ON u.user_id = wa.walker_id AND wa.status = 'accepted'
            LEFT JOIN WalkRequests req ON wa.request_id = req.request_id AND req.status = 'completed'
            LEFT JOIN WalkRatings wr ON req.request_id = wr.request_id AND u.user_id = wr.walker_id
            WHERE u.role = 'walker'
            GROUP BY u.user_id, u.username
            ORDER BY u.username
        `;

        const [results] = await db.execute(query);


        const formattedData = results.map(row => ({
            walker_username: row.walker_username,
            total_ratings: row.total_ratings,
            average_rating: row.average_rating ? parseFloat(row.average_rating.toFixed(1)) : null,
            completed_walks: row.completed_walks
        }));

        res.json(formattedData);

    } catch (error) {
        console.error('Error retrieving walker summary:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Could not retrieve walker summary'
        });
    }
});