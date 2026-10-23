package mindspace_backend;

import jakarta.persistence.*;

// Site-wide settings that an administrator can change.
@Entity
@Table(name = "settings")
public class Setting {

    @Id
    @Column(name = "setting_name", length = 60)
    private String name;

    @Column(name = "setting_value", nullable = false, length = 255)
    private String value;

    public Setting() {
    }

    public Setting(String name, String value) {
        this.name = name;
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}