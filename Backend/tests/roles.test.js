const { test, expect } = require('@playwright/test');
const { PlaywrightApiClient } = require('./utils/playwrightApiClient');
const { buildRole } = require('./utils/dataBuilders');
const { Role } = require('../models');

test.describe('Role Management', () => {
  let apiClient;
  let adminToken;
  let userToken;
  let testRoleId;

  test.beforeAll(async () => {
    apiClient = await new PlaywrightApiClient().init();
    
    // uzycie globalnych tokenow z setup
    adminToken = process.env.ADMIN_TOKEN;
    userToken = process.env.USER_TOKEN;
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test.describe('Role Listing', () => {
    // test pobrania listy wszystkich rol przez admina
    test('should allow admin to get all roles', async () => {
      const response = await apiClient.get('/api/roles', adminToken);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBe(2);
    });

    // test wyswietlania rol przez zwyklego uzytkownika
    test('should allow user to view roles', async () => {
      const response = await apiClient.get('/api/roles', userToken);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
    });

    // test odrzucenia pobierania rol bez tokenu
    test('should reject roles listing without token', async () => {
      const response = await apiClient.get('/api/roles');

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe('No token provided');
    });
  });

  test.describe('Role Creation', () => {
    // test tworzenia nowej roli przez admina
    test('should allow admin to create new role', async () => {
      const response = await apiClient.post(
        '/api/roles',
        buildRole({
          name: 'moderator',
          permissions: ['read', 'write'],
          description: 'Moderator role'
        }),
        adminToken
      );

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty('name', 'moderator');
      testRoleId = body.id;
    });

    // test zapobiegania tworzeniu roli z duplikatem nazwy
    test('should prevent duplicate role names', async () => {
      const response = await apiClient.post(
        '/api/roles',
        buildRole({
          name: 'moderator',
          permissions: ['read'],
          description: 'Duplicate moderator role'
        }),
        adminToken
      );

      expect(response.status()).toBe(500);
    });

    // test blokady tworzenia roli przez zwyklego uzytkownika
    test('should not allow user to create role', async () => {
      const response = await apiClient.post(
        '/api/roles',
        buildRole({
          name: 'test_role',
          permissions: ['read'],
          description: 'Test role'
        }),
        userToken
      );

      expect(response.status()).toBe(403);
    });
  });

  test.describe('Role Updates', () => {
    // test aktualizacji roli przez admina
    test('should allow admin to update role', async () => {
      const response = await apiClient.put(
        `/api/roles/${testRoleId}`,
        buildRole({
          name: 'moderator_updated',
          permissions: ['read', 'write', 'moderate'],
          description: 'Updated moderator role'
        }),
        adminToken
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.name).toBe('moderator_updated');
    });

    // test blokady aktualizacji roli przez zwyklego uzytkownika
    test('should not allow user to update role', async () => {
      const response = await apiClient.put(
        `/api/roles/${testRoleId}`,
        buildRole({
          name: 'moderator_fail',
          permissions: ['read'],
          description: 'Should fail'
        }),
        userToken
      );

      expect(response.status()).toBe(403);
    });

    // test zwrocenia 404 przy aktualizacji nieistniejącej roli
    test('should return 404 when updating missing role', async () => {
      const response = await apiClient.put(
        '/api/roles/99999',
        buildRole({
          name: 'missing',
          permissions: ['read'],
          description: 'missing role'
        }),
        adminToken
      );

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body.message).toBe('Role not found');
    });
  });

  test.describe('Role Deletion', () => {
    // test ochrony roli admin przed usunieciem
    test('should not allow deletion of admin role', async () => {
      const adminRole = await Role.findOne({ where: { name: 'admin' } });
      const response = await apiClient.delete(`/api/roles/${adminRole.id}`, adminToken);

      expect(response.status()).toBe(400);
    });

    // test usuwania customowej roli przez admina
    test('should allow admin to delete custom role', async () => {
      const response = await apiClient.delete(`/api/roles/${testRoleId}`, adminToken);

      expect(response.status()).toBe(200);
    });

    // test blokady usuwania roli przez zwyklego uzytkownika
    test('should not allow user to delete role', async () => {
      const response = await apiClient.delete(`/api/roles/${testRoleId}`, userToken);

      expect(response.status()).toBe(403);
    });

    // test zwrocenia 404 przy usuwaniu nieistniejącej roli
    test('should return 404 when deleting missing role', async () => {
      const response = await apiClient.delete('/api/roles/99999', adminToken);

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body.message).toBe('Role not found');
    });
  });
});