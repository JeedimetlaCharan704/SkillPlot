/**
 * @jest-environment jsdom
 */

const { Store } = require('../js/store/store')

beforeEach(() => {
  localStorage.clear()
  Store.reset()
})

describe('Store', () => {
  test('get returns default values', () => {
    expect(Store.get('isLoggedIn')).toBe(false)
    expect(Store.get('theme')).toBe('system')
    expect(Store.get('user')).toBeNull()
  })

  test('set stores and persists a value', () => {
    Store.set('theme', 'dark')
    expect(Store.get('theme')).toBe('dark')

    const raw = JSON.parse(localStorage.getItem('skillpilot_state'))
    expect(raw.theme).toBe('dark')
  })

  test('set overwrites previous value', () => {
    Store.set('theme', 'dark')
    Store.set('theme', 'light')
    expect(Store.get('theme')).toBe('light')
  })

  test('update merges objects', () => {
    Store.set('user', { name: 'Aryan' })
    Store.update('user', u => ({ ...u, email: 'a@b.com' }))
    expect(Store.get('user')).toEqual({ name: 'Aryan', email: 'a@b.com' })
  })

  test('subscribe notifies on set', () => {
    const cb = jest.fn()
    Store.subscribe('theme', cb)
    Store.set('theme', 'dark')
    expect(cb).toHaveBeenCalledWith('dark', 'system', 'theme')
  })

  test('subscribe notifies on update', () => {
    const cb = jest.fn()
    Store.subscribe('user', cb)
    Store.update('user', () => ({ name: 'Test' }))
    expect(cb).toHaveBeenCalled()
  })

  test('unsubscribe removes listener', () => {
    const cb = jest.fn()
    const unsub = Store.subscribe('theme', cb)
    unsub()
    Store.set('theme', 'dark')
    expect(cb).not.toHaveBeenCalled()
  })

  test('reset restores defaults', () => {
    Store.set('theme', 'dark')
    Store.set('user', { name: 'Test' })
    Store.reset()
    expect(Store.get('theme')).toBe('system')
    expect(Store.get('user')).toBeNull()
    expect(Store.get('isLoggedIn')).toBe(false)
  })

  test('getSnapshot returns a copy', () => {
    Store.set('theme', 'dark')
    const snap = Store.getSnapshot()
    expect(snap.theme).toBe('dark')
    snap.theme = 'light'
    expect(Store.get('theme')).toBe('dark')
  })

  test('importState merges with defaults', () => {
    Store.importState({ user: { name: 'Test' }, isLoggedIn: true })
    expect(Store.get('user').name).toBe('Test')
    expect(Store.get('isLoggedIn')).toBe(true)
    expect(Store.get('theme')).toBe('system')
  })
})
