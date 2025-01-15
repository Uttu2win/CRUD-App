package one.upswing.crud

import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Long>