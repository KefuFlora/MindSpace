package mindspace_backend;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaffWebConfig implements WebMvcConfigurer {

    private final StaffAuthInterceptor staffAuthInterceptor;

    public StaffWebConfig(StaffAuthInterceptor staffAuthInterceptor) {
        this.staffAuthInterceptor = staffAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(staffAuthInterceptor)
            .addPathPatterns("/api/admin/**");
    }

    // Makes http://localhost:8080/admin/ open the admin dashboard.
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addRedirectViewController("/admin", "/admin/");
        registry.addViewController("/admin/").setViewName("forward:/admin/index.html");
    }
}