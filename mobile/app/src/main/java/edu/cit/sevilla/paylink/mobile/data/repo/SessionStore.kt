package edu.cit.sevilla.paylink.mobile.data.repo

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStoreFile
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import edu.cit.sevilla.paylink.mobile.data.model.Session
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

class SessionStore(context: Context) {
    private val dataStore = PreferenceDataStoreFactory.create(
        produceFile = { context.preferencesDataStoreFile("session.preferences_pb") }
    )

    val sessionFlow: Flow<Session?> = dataStore.data
        .catch { ex ->
            if (ex is IOException) {
                emit(emptyPreferences())
            } else {
                throw ex
            }
        }
        .map { pref -> pref.toSessionOrNull() }

    suspend fun save(session: Session) {
        dataStore.edit { pref ->
            pref[Keys.TOKEN] = session.token
            pref[Keys.USER_ID] = session.userId
            pref[Keys.USERNAME] = session.username
            pref[Keys.EMAIL] = session.email
            pref[Keys.ROLE] = session.role
            pref[Keys.FIRST_NAME] = session.firstName
            pref[Keys.LAST_NAME] = session.lastName
            pref[Keys.EMPLOYEE_NUMBER] = session.employeeNumber
            pref[Keys.POSITION] = session.position
            pref[Keys.DEPARTMENT] = session.department
        }
    }

    suspend fun clear() {
        dataStore.edit { it.clear() }
    }

    private fun Preferences.toSessionOrNull(): Session? {
        val token = this[Keys.TOKEN] ?: return null
        return Session(
            token = token,
            userId = this[Keys.USER_ID] ?: 0L,
            username = this[Keys.USERNAME].orEmpty(),
            email = this[Keys.EMAIL].orEmpty(),
            role = this[Keys.ROLE].orEmpty(),
            firstName = this[Keys.FIRST_NAME].orEmpty(),
            lastName = this[Keys.LAST_NAME].orEmpty(),
            employeeNumber = this[Keys.EMPLOYEE_NUMBER].orEmpty(),
            position = this[Keys.POSITION].orEmpty(),
            department = this[Keys.DEPARTMENT].orEmpty(),
        )
    }

    private object Keys {
        val TOKEN = stringPreferencesKey("token")
        val USER_ID = longPreferencesKey("user_id")
        val USERNAME = stringPreferencesKey("username")
        val EMAIL = stringPreferencesKey("email")
        val ROLE = stringPreferencesKey("role")
        val FIRST_NAME = stringPreferencesKey("first_name")
        val LAST_NAME = stringPreferencesKey("last_name")
        val EMPLOYEE_NUMBER = stringPreferencesKey("employee_number")
        val POSITION = stringPreferencesKey("position")
        val DEPARTMENT = stringPreferencesKey("department")
    }
}
