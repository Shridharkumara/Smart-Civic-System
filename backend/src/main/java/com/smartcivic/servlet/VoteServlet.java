package com.smartcivic.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcivic.util.DbUtil;
import com.smartcivic.util.JwtUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

@WebServlet(urlPatterns = {"/api/vote"})
public class VoteServlet extends HttpServlet {
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        // Removed token check to allow public voting
        int userId = 1; // Use admin user for anonymous votes
        try {
            String body = readBody(request);
            Map<String, Integer> data = mapper.readValue(body, Map.class);
            int issueId = data.getOrDefault("issue_id", 0);
            try (Connection conn = DbUtil.getConnection()) {
                castVote(conn, response, userId, issueId);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            mapper.writeValue(response.getWriter(), Map.of("error", "Unable to process vote."));
        }
    }

    private void castVote(Connection conn, HttpServletResponse response, int userId, int issueId) throws SQLException, IOException {
        if (issueId <= 0) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            mapper.writeValue(response.getWriter(), Map.of("error", "Issue id is required."));
            return;
        }
        String insertSql = "INSERT INTO votes (user_id, issue_id) VALUES (?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(insertSql)) {
            stmt.setInt(1, userId);
            stmt.setInt(2, issueId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            if (e.getMessage().contains("Duplicate")) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                mapper.writeValue(response.getWriter(), Map.of("error", "You already upvoted this issue."));
                return;
            }
            throw e;
        }

        try (PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) AS total FROM votes WHERE issue_id = ?")) {
            stmt.setInt(1, issueId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                mapper.writeValue(response.getWriter(), Map.of("issue_id", issueId, "votes", rs.getInt("total")));
            }
        }
    }

    private String readBody(HttpServletRequest request) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }
}
