const db = require('../config/db');

class Course {
  static async findAll() {
    try {
      const [rows] = await db.query('SELECT * FROM courses');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(courseData) {
    try {
      const { title, description, credits, capacity } = courseData;
      const [result] = await db.query(
        'INSERT INTO courses (title, description, credits, capacity) VALUES (?, ?, ?, ?)',
        [title, description, credits, capacity]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Add update and delete methods similarly
}

module.exports = Course;