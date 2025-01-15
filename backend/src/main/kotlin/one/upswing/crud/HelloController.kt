package one.upswing.crud

import org.springframework.web.bind.annotation.*
import org.springframework.http.ResponseEntity
import org.springframework.http.HttpStatus
import org.slf4j.LoggerFactory

@CrossOrigin(origins = ["http://localhost:3000"])
@RestController
@RequestMapping("/users")
class UserController(val userRepository: UserRepository) {
    private val logger = LoggerFactory.getLogger(UserController::class.java)

    private fun createResponse(status: HttpStatus, errCode: Int, description: String, data: Any? = null): ResponseEntity<Map<String, Any>> {
        val response = mutableMapOf<String, Any>("statusCode" to errCode, "description" to description)
        data?.let { response["data"] = it }
        return ResponseEntity.status(status).body(response)
    }

    @PostMapping
    fun createUser(@RequestBody newUser: User): ResponseEntity<Map<String, Any>> {
        logger.info("Attempting to create user with ID: ${newUser.id}")
        if (userRepository.existsById(newUser.id)) {
            logger.warn("User ID ${newUser.id} already exists.")
            throw ConflictException("User ID already exists")
        }
        return try {
            userRepository.save(newUser)
            logger.info("User with ID: ${newUser.id} created successfully.")
            createResponse(HttpStatus.CREATED, 201, "User created successfully")
        } catch (ex: Exception) {
            logger.error("Internal server error while creating user", ex)
            throw InternalServerErrorException("Internal server error")
        }
    }

    @GetMapping
    fun listUsers(): ResponseEntity<Map<String, Any>> {
        logger.info("Fetching all users")
        return try {
            val users = userRepository.findAll()
            createResponse(HttpStatus.OK, 200, "Users fetched successfully", users)
        } catch (ex: Exception) {
            logger.error("Internal server error while fetching users", ex)
            throw InternalServerErrorException("Internal server error")
        }
    }

    @GetMapping("/{id}")
    fun getUser(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        logger.info("Fetching user with ID: $id")
        return userRepository.findById(id).map {
            logger.info("User with ID: $id found.")
            createResponse(HttpStatus.OK, 200, "User found", it)
        }.orElseThrow {
            logger.warn("User with ID: $id not found.")
            UserNotFoundException("User not found")
        }
    }

    @DeleteMapping("/{id}")
    fun deleteUser(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        logger.info("Attempting to delete user with ID: $id")
        if (!userRepository.existsById(id)) {
            logger.warn("User with ID: $id not found.")
            throw UserNotFoundException("User not found")
        }
        return try {
            userRepository.deleteById(id)
            logger.info("User with ID: $id deleted successfully.")
            createResponse(HttpStatus.NO_CONTENT, 204, "User deleted successfully")
        } catch (ex: Exception) {
            logger.error("Internal server error while deleting user", ex)
            throw InternalServerErrorException("Internal server error")
        }
    }

    @PutMapping("/{id}")
    fun updateUser(@PathVariable id: Long, @RequestBody updatedUser: User): ResponseEntity<Map<String, Any>> {
        logger.info("Attempting to update user with ID: $id")
        if (!userRepository.existsById(id)) {
            logger.warn("User with ID: $id not found.")
            throw UserNotFoundException("User not found")
        }
        return try {
            val existingUser = userRepository.findById(id).get()
            val newUser = existingUser.copy(
                name = updatedUser.name,
                age = updatedUser.age,
                address = updatedUser.address,
                phoneNumber = updatedUser.phoneNumber
            )
            userRepository.save(newUser)
            logger.info("User with ID: $id updated successfully.")
            createResponse(HttpStatus.OK, 200, "User updated successfully")
        } catch (ex: Exception) {
            logger.error("Internal server error while updating user", ex)
            throw InternalServerErrorException("Internal server error")
        }
    }

    @GetMapping("/search")
    fun searchUsersByName(@RequestParam name: String): ResponseEntity<Map<String, Any>> {
        logger.info("Searching users with name: $name")
        return try {
            val users = userRepository.findAll().filter { it.name.contains(name, ignoreCase = true) }
            if (users.isNotEmpty()) {
                logger.info("Found ${users.size} users matching the name: $name")
                createResponse(HttpStatus.OK, 200, "Users found", users)
            } else {
                logger.warn("No users found matching the name: $name")
                throw UserNotFoundException("No users found with the given name")
            }
        } catch (ex: Exception) {
            logger.error("Internal server error while searching users by name", ex)
            throw InternalServerErrorException("Internal server error")
        }
    }
}