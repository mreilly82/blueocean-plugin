package io.jenkins.blueocean;

/**
 * Stapler-bound object in the URL space that defines its own url name relative to its parent.
 *
 * <p>
 * This is often used as the basis of extension points.
 *
 * @author Kohsuke Kawaguchi
 */
public interface Routable {
    /**
     * Follows the same convention as Action.getUrlName()
     */
    String getUrlName();
}
