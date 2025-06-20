
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
        console.error('Error getting walker summary:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Could not get walker summary'
        });
    }
});