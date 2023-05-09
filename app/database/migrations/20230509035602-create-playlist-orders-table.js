'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.createTable(
      'playlist_orders',
      {
        id: {
          field: 'id',
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        visitorId: {
          field: 'visitor_id',
          type: Sequelize.UUID,
          allowNull: false,
        },
        track: {
          field: 'track',
          type: Sequelize.STRING(),
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
    await queryInterface.dropTable('playlist_orders');
  },
};
