export const respondToFollowRequest = async (req, res) => {
    try {
        const { requestUserId } = req.body; // The ID of the user who sent the follow request
        const loggedInUserId = req.user.id; // The authenticated user who is accepting/rejecting the request
        const { action } = req.body; // 'accept' or 'reject'

        // Find both users
        const requestUser = await User.findById(requestUserId);
        const loggedInUser = await User.findById(loggedInUserId);

        if (!requestUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the request exists in the pending requests
        if (!loggedInUser.pendingFollowRequests.includes(requestUserId)) {
            return res.status(400).json({ message: "No follow request from this user." });
        }

        if (action === 'accept') {
            // Add the request user to the followers list of the logged-in user
            loggedInUser.followers.push(requestUserId);
            requestUser.following.push(loggedInUserId);

            // Save both users
            await loggedInUser.save();
            await requestUser.save();

            // Remove the follow request from the pending list
            loggedInUser.pendingFollowRequests = loggedInUser.pendingFollowRequests.filter(
                id => id.toString() !== requestUserId
            );

            await loggedInUser.save();

            return res.status(200).json({ message: `You are now following ${requestUser.username}.` });
        } else if (action === 'reject') {
            // Remove the follow request from the pending list
            loggedInUser.pendingFollowRequests = loggedInUser.pendingFollowRequests.filter(
                id => id.toString() !== requestUserId
            );

            await loggedInUser.save();

            return res.status(200).json({ message: "Follow request rejected." });
        } else {
            return res.status(400).json({ message: "Invalid action." });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "An error occurred while responding to the follow request." });
    }
};
