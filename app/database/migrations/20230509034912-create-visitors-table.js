'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.createTable(
      'visitors',
      {
        id: {
          field: 'id',
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          field: 'name',
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        table: {
          field: 'table',
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        tableLimit: {
          field: 'table_limit',
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 2,
        },
        pub_id: {
          field: 'pub',
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: Sequelize.UUIDV4,
        },
        active: {
          field: 'active',
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
      },
      {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        transaction,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('visitors');
  },
};
