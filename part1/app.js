
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

        // Execute database query and destructure results
        const [queryResults] = await db.execute(sqlQuery);

        // Send successful response with open walk requests data
        res.status(200).json(queryResults);

    } catch (dbError) {
        // Log error details for debugging purposes
        console.error('Database query failed for open walk requests:', dbError);

        // Return structured error response to client
        res.status(500).json({
            error: 'Database operation failed',
            message: 'Unable to fetch open walk requests at this time',
            timestamp: new Date().toISOString()
        });
    }
});