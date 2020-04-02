package fr.inra.urgi.rarebasket.web.common;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;

/**
 * DTO used to transfer a page of data from the backend to the frontend, as JSON
 * @author JB Nizet
 */
public class PageDTO<T> {
    private final List<T> content;
    private final long totalElements;
    private final int totalPages;
    private final int size;
    private final int number;

    public PageDTO(List<T> content, int size, int number, long totalElements) {
        this.content = content;
        this.size = size;
        this.number = number;
        this.totalElements = totalElements;

        int pageCount = (int) (totalElements / size);
        if ((totalElements % size) > 0) {
            pageCount++;
        }
        this.totalPages = pageCount;
    }

    public static <E, T> PageDTO<T> fromPage(Page<E> page, Function<E, T> mapper) {
        return new PageDTO<T>(
            page.getContent().stream().map(mapper).collect(Collectors.toList()),
            page.getSize(),
            page.getNumber(),
            page.getTotalElements()
        );
    }

    public List<T> getContent() {
        return content;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public int getSize() {
        return size;
    }

    public int getNumber() {
        return number;
    }
}
