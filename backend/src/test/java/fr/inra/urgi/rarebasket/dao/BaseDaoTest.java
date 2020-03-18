package fr.inra.urgi.rarebasket.dao;

import javax.sql.DataSource;

import com.ninja_squad.dbsetup.DbSetup;
import com.ninja_squad.dbsetup.DbSetupTracker;
import com.ninja_squad.dbsetup.Operations;
import com.ninja_squad.dbsetup.destination.DataSourceDestination;
import com.ninja_squad.dbsetup.operation.Operation;
import fr.inra.urgi.rarebasket.TestProfile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.annotation.Rollback;

/**
 * Base class for DAO tests
 * @author JB Nizet
 */
@DataJpaTest
@TestProfile
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Rollback(false)
public class BaseDaoTest {
    private static final DbSetupTracker TRACKER = new DbSetupTracker();

    @Autowired
    private DataSource dataSource;

    protected void executeIfNecessary(Operation operation) {
        Operation completeOperation =
            Operations.sequenceOf(
                Operations.deleteAllFrom("basket"),
                operation
            );
        TRACKER.launchIfNecessary(new DbSetup(new DataSourceDestination(dataSource), completeOperation));
    }

    protected void skipNextLaunch() {
        TRACKER.skipNextLaunch();
    }
}
